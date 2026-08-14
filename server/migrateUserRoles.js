const mongoose = require('mongoose');
const connectDB = require('./src/config/db');
const User = require('./src/models/User');

async function assignDefaultRoles() {
    await connectDB();

    try {
        const result = await User.updateMany(
            { $or: [{ role: { $exists: false } }, { role: null }] },
            { $set: { role: 'user' } }
        );

        console.log(`Role migration completed. Updated ${result.modifiedCount} user(s).`);
    } catch (error) {
        console.error('Role migration failed:', error);
        process.exitCode = 1;
    } finally {
        await mongoose.connection.close();
    }
}

assignDefaultRoles();
