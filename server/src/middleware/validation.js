const {
    validateRegisterInput,
    validateLoginInput,
    validateForgotPasswordInput,
    validateResetPasswordInput,
    validateSessionInput,
    validateFollowInput,
    isValidObjectId,
} = require('../utils/validators');

// Validate Register Request
const validateRegisterRequest = (req, res, next) => {
    const { name, email, password, passwordConfirm } = req.body;
    const validation = validateRegisterInput(name, email, password, passwordConfirm);

    if (!validation.valid) {
        return res.status(400).json({ message: validation.message });
    }

    next();
};

// Validate Login Request
const validateLoginRequest = (req, res, next) => {
    const { email, password } = req.body;
    const validation = validateLoginInput(email, password);

    if (!validation.valid) {
        return res.status(400).json({ message: validation.message });
    }

    next();
};

const validateForgotPasswordRequest = (req, res, next) => {
    const { email } = req.body;
    const validation = validateForgotPasswordInput(email);

    if (!validation.valid) {
        return res.status(400).json({ message: validation.message });
    }

    next();
};

const validateResetPasswordRequest = (req, res, next) => {
    const { email, otp, password, passwordConfirm } = req.body;
    const validation = validateResetPasswordInput(email, otp, password, passwordConfirm);

    if (!validation.valid) {
        return res.status(400).json({ message: validation.message });
    }

    next();
};

const validateSessionRequest = (req, res, next) => {
    const { userId, sessionVersion } = req.body;
    const validation = validateSessionInput(userId, sessionVersion);

    if (!validation.valid) {
        return res.status(400).json({ message: validation.message });
    }

    next();
};

const validateFollowRequest = (req, res, next) => {
    const { followerUserId, followeeUserId } = req.body;
    const validation = validateFollowInput(followerUserId, followeeUserId);

    if (!validation.valid) {
        return res.status(400).json({ message: validation.message });
    }

    next();
};

// Validate ObjectId Parameter
const validateObjectIdParam = (paramName) => {
    return (req, res, next) => {
        const id = req.params[paramName];

        if (!isValidObjectId(id)) {
            return res.status(400).json({ message: `Invalid ${paramName}.` });
        }

        next();
    };
};

module.exports = {
    validateRegisterRequest,
    validateLoginRequest,
    validateForgotPasswordRequest,
    validateResetPasswordRequest,
    validateSessionRequest,
    validateFollowRequest,
    validateObjectIdParam,
};
