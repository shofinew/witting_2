const crypto = require('crypto');

const RESET_OTP_TTL_MINUTES = 20;
const MAX_RESET_OTP_ATTEMPTS = 5;

const generateOtp = () => {
    return String(Math.floor(100000 + Math.random() * 900000));
};

const hashOtp = (otp) => {
    return crypto.createHash('sha256').update(String(otp)).digest('hex');
};

module.exports = {
    RESET_OTP_TTL_MINUTES,
    MAX_RESET_OTP_ATTEMPTS,
    generateOtp,
    hashOtp,
};
