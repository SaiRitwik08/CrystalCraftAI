import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectToMongo } from './lib/mongoClient.js';
import generateRouter from './routes/generate.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Routes
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

app.use('/api', generateRouter);

// Start server
async function startServer() {
    await connectToMongo().catch(err => console.error("Initial Mongo connection failed, starting regardless..."));

    app.listen(PORT, () => {
        console.log(`Backend server running on port ${PORT}`);
    });
}

startServer();
