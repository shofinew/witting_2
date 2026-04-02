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

const validateCreateEventInput = (creatorId, targetId, description, date, timeDuration, constraints) => {
    if (!creatorId || !targetId || !description || !date || !timeDuration) {
        return { valid: false, message: 'creatorId, targetId, description, date, and timeDuration are required.' };
    }

    if (!isValidObjectId(creatorId) || !isValidObjectId(targetId)) {
        return { valid: false, message: 'Invalid creatorId or targetId.' };
    }

    const durationNumber = Number(timeDuration);
    if (!Number.isInteger(durationNumber) || durationNumber < constraints.MIN || durationNumber > constraints.MAX) {
        return {
            valid: false,
            message: `timeDuration must be a whole number between ${constraints.MIN} and ${constraints.MAX}.`,
        };
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

    return { valid: true, durationNumber };
};

module.exports = {
    isValidObjectId,
    isValidEmail,
    validateRegisterInput,
    validateLoginInput,
    validateCreateEventInput,
    validateUpdateEventInput,
};
