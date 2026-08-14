const mongoose = require('mongoose');

const isValidObjectId = (value) => {
    return mongoose.Types.ObjectId.isValid(value);
};

const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

const validateRegisterInput = (name, email, password, passwordConfirm) => {
    if (!name || !email || !password || !passwordConfirm) {
        return { valid: false, message: 'All fields are required.' };
    }

    if (!isValidEmail(email)) {
        return { valid: false, message: 'Invalid email format.' };
    }

    if (password !== passwordConfirm) {
        return { valid: false, message: 'Passwords do not match.' };
    }

    if (password.length < 8) {
        return { valid: false, message: 'Password must be at least 8 characters long.' };
    }

    return { valid: true };
};

const validateLoginInput = (email, password) => {
    if (!email || !password) {
        return { valid: false, message: 'Email and password are required.' };
    }

    if (!isValidEmail(email)) {
        return { valid: false, message: 'Invalid email format.' };
    }

    return { valid: true };
};

const validateCreateEventInput = (creator, target, description, date, timeDuration, constraints) => {
    if (!creator || !target || !description || !date || !timeDuration) {
        return { valid: false, message: 'creator, target, description, date, and timeDuration are required.' };
    }

    if (!isValidObjectId(creator) || !isValidObjectId(target)) {
        return { valid: false, message: 'Invalid creator or target.' };
    }

    const durationNumber = Number(timeDuration);
    if (!Number.isInteger(durationNumber) || durationNumber < constraints.MIN || durationNumber > constraints.MAX) {
        return {
            valid: false,
            message: `timeDuration must be a whole number between ${constraints.MIN} and ${constraints.MAX}.`,
        };
    }

    const eventDateValidation = validateEventDate(date);
    if (!eventDateValidation.valid) {
        return eventDateValidation;
    }

    return { valid: true, durationNumber };
};

const validateUpdateEventInput = (description, date, timeDuration, constraints) => {
    if (!description || !date || !timeDuration) {
        return { valid: false, message: 'description, date, and timeDuration are required.' };
    }

    const durationNumber = Number(timeDuration);
    if (!Number.isInteger(durationNumber) || durationNumber < constraints.MIN || durationNumber > constraints.MAX) {
        return {
            valid: false,
            message: `timeDuration must be a whole number between ${constraints.MIN} and ${constraints.MAX}.`,
        };
    }

    const eventDateValidation = validateEventDate(date);
    if (!eventDateValidation.valid) {
        return eventDateValidation;
    }

    return { valid: true, durationNumber };
};

const validateCreatePublicEventInput = (creatorId, title, description, location, startDate, startTime, endDate, endTime) => {
    if (!creatorId || !title || !description || !location || !startDate || !startTime || !endDate || !endTime) {
        return { valid: false, message: 'creatorId, title, description, location, startDate, startTime, endDate, and endTime are required.' };
    }

    if (!isValidObjectId(creatorId)) {
        return { valid: false, message: 'Invalid creator ID.' };
    }

    if (!/^([01]\d|2[0-3]):([0-5]\d)$/.test(String(startTime).trim())) {
        return { valid: false, message: 'Start time must be in HH:MM format.' };
    }

    if (!/^([01]\d|2[0-3]):([0-5]\d)$/.test(String(endTime).trim())) {
        return { valid: false, message: 'End time must be in HH:MM format.' };
    }

    const startValidation = validateEventDate(startDate);
    if (!startValidation.valid) {
        return startValidation;
    }

    const endValidation = validateEventDate(endDate);
    if (!endValidation.valid) {
        return endValidation;
    }

    const startDateTime = new Date(`${startDate}T${startTime}`);
    const endDateTime = new Date(`${endDate}T${endTime}`);

    if (Number.isNaN(startDateTime.getTime()) || Number.isNaN(endDateTime.getTime())) {
        return { valid: false, message: 'Invalid start or end date/time.' };
    }

    if (endDateTime <= startDateTime) {
        return { valid: false, message: 'End date/time must be after start date/time.' };
    }

    const durationMinutes = Math.round((endDateTime - startDateTime) / 60000);
    if (durationMinutes <= 0) {
        return { valid: false, message: 'Duration must be positive.' };
    }

    return { valid: true, durationMinutes };
};

const validateEventDate = (date) => {
    if (!date) {
        return { valid: false, message: 'Event date is required.' };
    }

    const eventDate = parseDateOnly(date);
    if (!eventDate) {
        return { valid: false, message: 'Invalid event date.' };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    eventDate.setHours(0, 0, 0, 0);

    if (eventDate < today) {
        return { valid: false, message: 'Event date must be today or a future date.' };
    }

    return { valid: true };
};

const validateForgotPasswordInput = (email) => {
    if (!email) {
        return { valid: false, message: 'Email is required.' };
    }

    if (!isValidEmail(email)) {
        return { valid: false, message: 'Invalid email format.' };
    }

    return { valid: true };
};

const validateResetPasswordInput = (email, otp, password, passwordConfirm) => {
    if (!email || !otp || !password || !passwordConfirm) {
        return { valid: false, message: 'Email, OTP, password, and confirm password are required.' };
    }

    if (!isValidEmail(email)) {
        return { valid: false, message: 'Invalid email format.' };
    }

    if (!/^\d{6}$/.test(String(otp).trim())) {
        return { valid: false, message: 'OTP must be a 6-digit number.' };
    }

    if (password !== passwordConfirm) {
        return { valid: false, message: 'Passwords do not match.' };
    }

    if (password.length < 8) {
        return { valid: false, message: 'Password must be at least 8 characters long.' };
    }

    return { valid: true };
};

const validateSessionInput = (userId, sessionVersion) => {
    if (!userId) {
        return { valid: false, message: 'User ID is required.' };
    }

    if (!isValidObjectId(userId)) {
        return { valid: false, message: 'Invalid user ID.' };
    }

    if (sessionVersion === undefined || sessionVersion === null || Number.isNaN(Number(sessionVersion))) {
        return { valid: false, message: 'Session version is required.' };
    }

    return { valid: true };
};

const validateFollowInput = (followerUserId, followeeUserId) => {
    if (!followerUserId || !followeeUserId) {
        return { valid: false, message: 'Follower user ID and followee user ID are required.' };
    }

    if (!isValidObjectId(followerUserId) || !isValidObjectId(followeeUserId)) {
        return { valid: false, message: 'Invalid follower user ID or followee user ID.' };
    }

    if (String(followerUserId) === String(followeeUserId)) {
        return { valid: false, message: 'You cannot follow yourself.' };
    }

    return { valid: true };
};

const validateBlockInput = (blockerUserId, blockedUserId) => {
    if (!blockerUserId || !blockedUserId) {
        return { valid: false, message: 'Blocker user ID and blocked user ID are required.' };
    }

    if (!isValidObjectId(blockerUserId) || !isValidObjectId(blockedUserId)) {
        return { valid: false, message: 'Invalid blocker user ID or blocked user ID.' };
    }

    if (String(blockerUserId) === String(blockedUserId)) {
        return { valid: false, message: 'You cannot block yourself.' };
    }

    return { valid: true };
};

const validateDateOfBirth = (dateOfBirth) => {
    if (!dateOfBirth) {
        return { valid: true };
    }

    const birthDate = parseDateOnly(dateOfBirth);
    if (!birthDate) {
        return { valid: false, message: 'Invalid date of birth.' };
    }

    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }

    if (age < 16) {
        return { valid: false, message: 'You must be at least 16 years old.' };
    }

    return { valid: true };
};

const parseDateOnly = (value) => {
    const normalizedValue = String(value).trim();
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(normalizedValue);

    if (!match) {
        return null;
    }

    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    const parsedDate = new Date(year, month - 1, day);

    if (
        parsedDate.getFullYear() !== year
        || parsedDate.getMonth() !== month - 1
        || parsedDate.getDate() !== day
    ) {
        return null;
    }

    return parsedDate;
};

module.exports = {
    isValidObjectId,
    isValidEmail,
    validateRegisterInput,
    validateLoginInput,
    validateForgotPasswordInput,
    validateResetPasswordInput,
    validateSessionInput,
    validateFollowInput,
    validateBlockInput,
    validateCreateEventInput,
    validateCreatePublicEventInput,
    validateUpdateEventInput,
    validateDateOfBirth,
    validateEventDate,
};
