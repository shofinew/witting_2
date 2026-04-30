const mongoose = require('mongoose');
const connectDB = require('./src/config/db');
const User = require('./src/models/User');

async function assignUniqueIDs() {
    await connectDB();

    try {
        // Get all existing uniqueIDs
        const existingIDs = await User.find({ uniqueID: { $exists: true } }, { uniqueID: 1 }).sort({ uniqueID: 1 });
        const usedIDs = new Set(existingIDs.map(u => u.uniqueID));

        const usersWithoutID = await User.find({ uniqueID: { $exists: false } }).sort({ createdAt: 1 });

        for (const user of usersWithoutID) {
            // Find the smallest available ID
            let id = 1;
            while (usedIDs.has(id)) {
                id++;
            }
            user.uniqueID = id;
            usedIDs.add(id);
            await user.save();
            console.log(`Assigned uniqueID ${id} to user ${user.email}`);
        }

        console.log('Migration completed.');
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        mongoose.connection.close();
    }
}

assignUniqueIDs();