require('dotenv').config();

const mongoose = require('mongoose');
const connectDB = require('./src/config/db');
const { migrateUniqueIDs } = require('./src/services/uniqueIDMigration');

const run = async () => {
    await connectDB();

    try {
        const count = await migrateUniqueIDs();
        console.log('Migration completed. Processed ' + count + ' users.');
    } catch (error) {
        console.error('Migration failed:', error);
        process.exitCode = 1;
    } finally {
        await mongoose.connection.close();
    }
};

run();
