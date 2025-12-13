import { MongoClient } from 'mongodb';

let client;
let db;

export async function connectToMongo() {
    if (db) return db;

    if (!process.env.MONGO_URI) {
        console.warn("MONGO_URI is not defined in environment variables.");
        // Return a mock DB or throw error depending on strictness.
        // For now, we allow starting without Mongo but requests might fail if they need it.
        return null;
    }

    try {
        client = new MongoClient(process.env.MONGO_URI);
        await client.connect();
        db = client.db(process.env.MONGO_DB || 'crystalcraft');
        console.log('Connected to MongoDB');
        return db;
    } catch (error) {
        console.error('Failed to connect to MongoDB', error);
        throw error;
    }
}

export function getDb() {
    if (!db) {
        throw new Error('Database not initialized. Call connectToMongo first.');
    }
    return db;
}
