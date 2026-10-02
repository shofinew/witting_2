const mongoose = require('mongoose');
const Sequence = require('../models/Sequence');
const {
    UNIQUE_ID_COUNTER,
    MAX_SEQUENCE,
    sequenceToUniqueID,
    uniqueIDToSequence,
} = require('../utils/uniqueID');

const migrateUniqueIDs = async () => {
    const usersCollection = mongoose.connection.collection('users');
    const userDocuments = await usersCollection.find(
        {},
        { projection: { uniqueID: 1, createdAt: 1 } }
    ).sort({ createdAt: 1, _id: 1 }).toArray();
    const usedSequences = new Set();

    for (const user of userDocuments) {
        const currentID = String(user.uniqueID || '').toUpperCase();
        const currentSequence = uniqueIDToSequence(currentID);

        if (currentSequence && currentSequence <= MAX_SEQUENCE) {
            usedSequences.add(currentSequence);
        }
    }

    for (const user of userDocuments) {
        const currentID = String(user.uniqueID || '').toUpperCase();
        const currentSequence = uniqueIDToSequence(currentID);

        if (currentSequence && currentSequence <= MAX_SEQUENCE) {
            continue;
        }

        const legacySequence = /^\d+$/.test(currentID)
            ? Number(currentID)
            : null;
        let nextSequence = legacySequence && legacySequence <= MAX_SEQUENCE && !usedSequences.has(legacySequence)
            ? legacySequence
            : 1;

        while (usedSequences.has(nextSequence)) {
            nextSequence += 1;
        }
        if (nextSequence > MAX_SEQUENCE) {
            throw new Error('There are more users than the supported unique ID range.');
        }

        const nextID = sequenceToUniqueID(nextSequence);
        await usersCollection.updateOne(
            { _id: user._id },
            { $set: { uniqueID: nextID, updatedAt: new Date() } }
        );
        user.uniqueID = nextID;
        usedSequences.add(nextSequence);
        console.log('Assigned uniqueID ' + nextID + ' to user ' + user._id);
    }

    const highestSequence = usedSequences.size ? Math.max(...usedSequences) : 0;
    await Sequence.findOneAndUpdate(
        { _id: UNIQUE_ID_COUNTER },
        { $max: { sequence: highestSequence } },
        { upsert: true, setDefaultsOnInsert: true }
    );

    return userDocuments.length;
};

module.exports = { migrateUniqueIDs };
