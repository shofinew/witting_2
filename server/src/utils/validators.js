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

const validateCreatePublicEventInput = (creatorId, title, description, date, time) => {
    if (!creatorId || !title || !description || !date || !time) {
        return { valid: false, message: 'creatorId, title, description, date, and time are required.' };
    }

    if (!isValidObjectId(creatorId)) {
        return { valid: false, message: 'Invalid creator ID.' };
    }

    if (!/^([01]\d|2[0-3]):([0-5]\d)$/.test(String(time).trim())) {
        return { valid: false, message: 'Time must be in HH:MM format.' };
    }

    const eventDateValidation = validateEventDate(date);
    if (!eventDateValidation.valid) {
        return eventDateValidation;
    }

    return { valid: true };
};

const validateEventDate = (date) => {
    if (!date) {
        return { valid: false, message: 'Event date is required.' };
    }

    const eventDate = new Date(date);
    if (Number.isNaN(eventDate.getTime())) {
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

const validateDateOfBirth = (dateOfBirth) => {
    if (!dateOfBirth) {
        return { valid: true };
    }

    const birthDate = new Date(dateOfBirth);
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

module.exports = {
    isValidObjectId,
    isValidEmail,
    validateRegisterInput,
    validateLoginInput,
    validateForgotPasswordInput,
    validateResetPasswordInput,
    validateSessionInput,
    validateFollowInput,
    validateCreateEventInput,
    validateCreatePublicEventInput,
    validateUpdateEventInput,
    validateDateOfBirth,
    validateEventDate,
};
