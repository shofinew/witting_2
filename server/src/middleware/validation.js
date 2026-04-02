const { validateRegisterInput, validateLoginInput, isValidObjectId } = require('../utils/validators');

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
    validateObjectIdParam,
};
