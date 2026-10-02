const mongoose = require('mongoose');

const sequenceSchema = new mongoose.Schema({
    _id: {
        type: String,
        required: true,
    },
    sequence: {
        type: Number,
        required: true,
        default: 0,
        min: 0,
        max: 6759999999324,
    },
}, {
    versionKey: false,
});

module.exports = mongoose.model('Sequence', sequenceSchema);
