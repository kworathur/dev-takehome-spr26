import mongoose from 'mongoose';

/**
 * Establish a database connection using connection string
 * read from enviroinment variables
 * @returns
 */
export default async function connectDB() {
    if (mongoose.connections[0].readyState) return;

    await mongoose
        .connect(process.env.MONGO_DB!, {
            dbName: process.env.DB_NAME,
        })
        .catch((e) => {
            console.error('Error connecting to database.');
            throw e;
        });
}
