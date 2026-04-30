const bcrypt = require('bcrypt');
const User = require('../models/User');
const Follower = require('../models/Follower');
const PasswordResetOtp = require('../models/PasswordResetOtp');
const auditLogService = require('./auditLogService');
const { RESET_OTP_TTL_MINUTES, MAX_RESET_OTP_ATTEMPTS, generateOtp, hashOtp } = require('../utils/otp');
const { isValidObjectId } = require('../utils/validators');

const buildSafeUser = (user) => ({
    _id: user._id,
    uniqueID: user.uniqueID,
    name: user.name,
    email: user.email,
    phone: user.phone,
    country: user.country,
    dateOfBirth: user.dateOfBirth,
    gender: user.gender,
    specialistAt: user.specialistAt,
    profession: user.profession,
    chamber: user.chamber,
    designation: user.designation,
    achievement: user.achievement,
    createdAt: user.createdAt,
    memberSince: user.memberSince,
    sessionVersion: user.sessionVersion || 0,
});

const enrichUsersWithFollowData = async (users, viewerUserId = null) => {
    if (!users.length) {
        return [];
    }

    const normalizedUsers = users.map((user) => buildSafeUser(user));
    const userIds = normalizedUsers.map((user) => user._id);
    const normalizedViewerUserId = isValidObjectId(viewerUserId) ? viewerUserId : null;

    const [followerCounts, followeeCounts, viewerFollows] = await Promise.all([
        Follower.aggregate([
            { $match: { followeeUser: { $in: userIds } } },
            { $group: { _id: '$followeeUser', totalFollowers: { $sum: 1 } } },
        ]),
        Follower.aggregate([
            { $match: { followerUser: { $in: userIds } } },
            { $group: { _id: '$followerUser', totalFollowees: { $sum: 1 } } },
        ]),
        normalizedViewerUserId
            ? Follower.find({
                followerUser: normalizedViewerUserId,
                followeeUser: { $in: userIds },
            }).select('followeeUser').lean()
            : [],
    ]);

    const followerCountMap = new Map(
        followerCounts.map((entry) => [String(entry._id), entry.totalFollowers])
    );
    const followeeCountMap = new Map(
        followeeCounts.map((entry) => [String(entry._id), entry.totalFollowees])
    );
    const viewerFollowingSet = new Set(
        viewerFollows.map((entry) => String(entry.followeeUser))
    );

    return normalizedUsers.map((user) => ({
        ...user,
        totalFollowers: followerCountMap.get(String(user._id)) || 0,
        totalFollowee: followeeCountMap.get(String(user._id)) || 0,
        isFollowing: normalizedViewerUserId ? viewerFollowingSet.has(String(user._id)) : false,
    }));
};

const authService = {
    // Register a new user
    register: async (name, email, password, context = {}) => {
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            const error = new Error('Email already in use.');
            error.statusCode = 409;
            throw error;
        }

        // Find the next available uniqueID
        const existingIDs = await User.find({}, { uniqueID: 1 }).sort({ uniqueID: 1 });
        const usedIDs = existingIDs.map(u => u.uniqueID);
        let uniqueID = 1;
        while (usedIDs.includes(uniqueID)) {
            uniqueID++;
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({
            uniqueID,
            name: name.trim(),
            email: email.toLowerCase().trim(),
            password: hashedPassword,
            memberSince: new Date(),
        });

        await user.save();
        await auditLogService.create({
            userId: user._id,
            email: user.email,
            action: 'register',
            status: 'success',
            ipAddress: context.ipAddress,
            userAgent: context.userAgent,
            details: 'User account created.',
        });
        const [safeUser] = await enrichUsersWithFollowData([user], user._id);
        return safeUser;
    },

    // Login user
    login: async (email, password, context = {}) => {
        const user = await User.findOne({ email: email.toLowerCase().trim() });
        if (!user) {
            await auditLogService.create({
                email,
                action: 'login',
                status: 'failed',
                ipAddress: context.ipAddress,
                userAgent: context.userAgent,
                details: 'Login failed because no user matched the email.',
            });
            const error = new Error('Invalid email or password.');
            error.statusCode = 401;
            throw error;
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            await auditLogService.create({
                userId: user._id,
                email: user.email,
                action: 'login',
                status: 'failed',
                ipAddress: context.ipAddress,
                userAgent: context.userAgent,
                details: 'Login failed because the password was incorrect.',
            });
            const error = new Error('Invalid email or password.');
            error.statusCode = 401;
            throw error;
        }

        await auditLogService.create({
            userId: user._id,
            email: user.email,
            action: 'login',
            status: 'success',
            ipAddress: context.ipAddress,
            userAgent: context.userAgent,
            details: 'Login successful.',
        });

        const [safeUser] = await enrichUsersWithFollowData([user], user._id);
        return safeUser;
    },

    requestPasswordReset: async (email, context = {}) => {
        const normalizedEmail = String(email || '').toLowerCase().trim();
        const user = await User.findOne({ email: normalizedEmail });

        if (!user) {
            await auditLogService.create({
                email: normalizedEmail,
                action: 'password_reset_request',
                status: 'failed',
                ipAddress: context.ipAddress,
                userAgent: context.userAgent,
                details: 'Password reset requested for an unknown email.',
            });

            return {
                message: 'If the account exists, an OTP has been generated.',
            };
        }

        await PasswordResetOtp.deleteMany({ user: user._id });

        const otp = generateOtp();
        const expiresAt = new Date(Date.now() + RESET_OTP_TTL_MINUTES * 60 * 1000);

        await PasswordResetOtp.create({
            user: user._id,
            email: user.email,
            otpHash: hashOtp(otp),
            expiresAt,
        });

        await auditLogService.create({
            userId: user._id,
            email: user.email,
            action: 'password_reset_request',
            status: 'success',
            ipAddress: context.ipAddress,
            userAgent: context.userAgent,
            details: `Password reset OTP generated with ${RESET_OTP_TTL_MINUTES}-minute validity.`,
        });

        return {
            message: 'If the account exists, an OTP has been generated.',
            expiresAt,
            otpPreview: process.env.NODE_ENV === 'production' ? undefined : otp,
        };
    },

    resetPasswordWithOtp: async (email, otp, password, context = {}) => {
        const normalizedEmail = String(email || '').toLowerCase().trim();
        const normalizedOtp = String(otp || '').trim();
        const user = await User.findOne({ email: normalizedEmail });

        if (!user) {
            await auditLogService.create({
                email: normalizedEmail,
                action: 'password_reset_confirm',
                status: 'failed',
                ipAddress: context.ipAddress,
                userAgent: context.userAgent,
                details: 'Password reset failed because no user matched the email.',
            });
            const error = new Error('Invalid email or OTP.');
            error.statusCode = 400;
            throw error;
        }

        const resetRecord = await PasswordResetOtp.findOne({
            user: user._id,
            consumedAt: null,
        }).sort({ createdAt: -1 });

        if (!resetRecord) {
            await auditLogService.create({
                userId: user._id,
                email: user.email,
                action: 'password_reset_confirm',
                status: 'failed',
                ipAddress: context.ipAddress,
                userAgent: context.userAgent,
                details: 'Password reset failed because no active OTP was found.',
            });
            const error = new Error('No active OTP found. Please request a new one.');
            error.statusCode = 400;
            throw error;
        }

        if (resetRecord.expiresAt.getTime() < Date.now()) {
            await auditLogService.create({
                userId: user._id,
                email: user.email,
                action: 'password_reset_confirm',
                status: 'failed',
                ipAddress: context.ipAddress,
                userAgent: context.userAgent,
                details: 'Password reset failed because the OTP expired.',
            });
            const error = new Error('OTP has expired. Please request a new one.');
            error.statusCode = 400;
            throw error;
        }

        if (resetRecord.attempts >= MAX_RESET_OTP_ATTEMPTS) {
            resetRecord.consumedAt = new Date();
            await resetRecord.save();
            await auditLogService.create({
                userId: user._id,
                email: user.email,
                action: 'password_reset_confirm',
                status: 'failed',
                ipAddress: context.ipAddress,
                userAgent: context.userAgent,
                details: 'Password reset failed because the OTP attempt limit was reached.',
            });
            const error = new Error('OTP attempt limit reached. Please request a new one.');
            error.statusCode = 429;
            throw error;
        }

        const isOtpValid = resetRecord.otpHash === hashOtp(normalizedOtp);
        if (!isOtpValid) {
            resetRecord.attempts += 1;
            await resetRecord.save();
            await auditLogService.create({
                userId: user._id,
                email: user.email,
                action: 'password_reset_confirm',
                status: 'failed',
                ipAddress: context.ipAddress,
                userAgent: context.userAgent,
                details: `Password reset failed because the OTP was incorrect. Attempt ${resetRecord.attempts} of ${MAX_RESET_OTP_ATTEMPTS}.`,
            });
            const attemptsRemaining = Math.max(0, MAX_RESET_OTP_ATTEMPTS - resetRecord.attempts);
            const error = new Error(
                attemptsRemaining > 0
                    ? `Invalid OTP. ${attemptsRemaining} attempt${attemptsRemaining === 1 ? '' : 's'} remaining.`
                    : 'OTP attempt limit reached. Please request a new one.'
            );
            error.statusCode = attemptsRemaining > 0 ? 400 : 429;
            throw error;
        }

        user.password = await bcrypt.hash(password, 10);
        user.sessionVersion = (user.sessionVersion || 0) + 1;
        user.passwordChangedAt = new Date();
        await user.save();

        resetRecord.consumedAt = new Date();
        await resetRecord.save();
        await PasswordResetOtp.deleteMany({ user: user._id, _id: { $ne: resetRecord._id } });

        await auditLogService.create({
            userId: user._id,
            email: user.email,
            action: 'password_reset_confirm',
            status: 'success',
            ipAddress: context.ipAddress,
            userAgent: context.userAgent,
            details: 'Password reset completed and all existing sessions were invalidated.',
        });

        return {
            message: 'Password reset successful. All devices have been logged out.',
        };
    },

    validateSession: async (userId, sessionVersion) => {
        const user = await User.findById(userId).select('sessionVersion');
        if (!user) {
            return { valid: false, reason: 'User not found.' };
        }

        return {
            valid: Number(user.sessionVersion || 0) === Number(sessionVersion || 0),
            reason: Number(user.sessionVersion || 0) === Number(sessionVersion || 0)
                ? 'Session is valid.'
                : 'Session expired after a password reset.',
        };
    },

    getAuditLogs: async (userId) => {
        const user = await User.findById(userId).select('_id');
        if (!user) {
            const error = new Error('User not found.');
            error.statusCode = 404;
            throw error;
        }

        return auditLogService.getUserLogs(userId);
    },

    // Get all users
    getAllUsers: async (viewerUserId = null) => {
        const users = await User.find({}, '-password -sessionVersion -passwordChangedAt').sort({ uniqueID: 1 }).lean();
        return enrichUsersWithFollowData(users, viewerUserId);
    },

    // Get single user
    getUserById: async (userId, viewerUserId = null) => {
        const user = await User.findById(userId, '-password -sessionVersion -passwordChangedAt').lean();
        if (!user) {
            const error = new Error('User not found.');
            error.statusCode = 404;
            throw error;
        }

        const [safeUser] = await enrichUsersWithFollowData([user], viewerUserId);
        return safeUser;
    },

    // Update user profile
    updateProfile: async (userId, updates) => {
        const { validateDateOfBirth } = require('../utils/validators');
        
        const allowedFields = ['phone', 'country', 'dateOfBirth', 'gender', 'specialistAt', 'profession', 'chamber', 'designation', 'achievement'];
        const filteredUpdates = {};

        for (const field of allowedFields) {
            if (updates[field] !== undefined) {
                filteredUpdates[field] = field === 'country' && typeof updates[field] === 'string'
                    ? updates[field].toUpperCase().trim()
                    : updates[field];
            }
        }

        if (filteredUpdates.dateOfBirth) {
            const dateValidation = validateDateOfBirth(filteredUpdates.dateOfBirth);
            if (!dateValidation.valid) {
                const error = new Error(dateValidation.message);
                error.statusCode = 400;
                throw error;
            }
        }

        const user = await User.findByIdAndUpdate(userId, filteredUpdates, { new: true, runValidators: true });
        if (!user) {
            const error = new Error('User not found.');
            error.statusCode = 404;
            throw error;
        }

        const [safeUser] = await enrichUsersWithFollowData([user], user._id);
        return safeUser;
    },

    toggleFollow: async (followerUserId, followeeUserId) => {
        const [followerUser, followeeUser] = await Promise.all([
            User.findById(followerUserId),
            User.findById(followeeUserId),
        ]);

        if (!followerUser || !followeeUser) {
            const error = new Error('User not found.');
            error.statusCode = 404;
            throw error;
        }

        const existingRelationship = await Follower.findOne({
            followerUser: followerUserId,
            followeeUser: followeeUserId,
        });

        let isFollowing = false;

        if (existingRelationship) {
            await Follower.deleteOne({ _id: existingRelationship._id });
        } else {
            await Follower.create({
                followerUser: followerUserId,
                followeeUser: followeeUserId,
            });
            isFollowing = true;
        }

        const [currentUserProfile, targetUserProfile] = await enrichUsersWithFollowData(
            [followerUser, followeeUser],
            followerUser._id
        );

        return {
            isFollowing,
            currentUser: currentUserProfile,
            targetUser: targetUserProfile,
        };
    },
};

module.exports = authService;
