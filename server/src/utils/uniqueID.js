const Sequence = require('../models/Sequence');

const UNIQUE_ID_COUNTER = 'userUniqueID';
const NUMERIC_RANGE = 9999999999;
const PREFIX_RANGE = 26 * 26;
const MAX_SEQUENCE = NUMERIC_RANGE * PREFIX_RANGE;

const sequenceToPrefix = (sequence) => {
    const prefixIndex = Math.floor((sequence - 1) / NUMERIC_RANGE);
    const firstLetter = String.fromCharCode(65 + Math.floor(prefixIndex / 26));
    const secondLetter = String.fromCharCode(65 + (prefixIndex % 26));
    return firstLetter + secondLetter;
};

const uniqueIDToSequence = (uniqueID) => {
    const match = String(uniqueID || '').toUpperCase().match(/^([A-Z]{2})(\d{10})$/);
    if (!match) {
        return null;
    }

    const prefixIndex = (match[1].charCodeAt(0) - 65) * 26
        + (match[1].charCodeAt(1) - 65);
    const numericPart = Number(match[2]);
    if (numericPart < 1 || numericPart > NUMERIC_RANGE) {
        return null;
    }

    return prefixIndex * NUMERIC_RANGE + numericPart;
};

const sequenceToUniqueID = (sequence) => {
    if (!Number.isSafeInteger(sequence) || sequence < 1 || sequence > MAX_SEQUENCE) {
        throw new Error('Unique ID sequence limit has been reached.');
    }

    const numericPart = ((sequence - 1) % NUMERIC_RANGE) + 1;
    return sequenceToPrefix(sequence) + String(numericPart).padStart(10, '0');
};

const getNextUniqueID = async () => {
    const counter = await Sequence.findOneAndUpdate(
        { _id: UNIQUE_ID_COUNTER },
        { $inc: { sequence: 1 } },
        { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    return sequenceToUniqueID(counter.sequence);
};

module.exports = {
    UNIQUE_ID_COUNTER,
    NUMERIC_RANGE,
    MAX_SEQUENCE,
    getNextUniqueID,
    sequenceToUniqueID,
    uniqueIDToSequence,
};
