import express from 'express';
import fetch from 'node-fetch';
import { getDb } from '../lib/mongoClient.js';

const router = express.Router();

router.post('/generate', async (req, res) => {
    try {
        const { formula } = req.body;

        if (!formula) {
            return res.status(400).json({ error: 'Formula is required' });
        }

        const flaskUrl = process.env.FLASK_URL || 'http://localhost:5001';

        let flaskRes;
        try {
            flaskRes = await fetch(`${flaskUrl}/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ formula })
            });
        } catch (err) {
            console.error("Flask connection error:", err);
            return res.status(503).json({ error: 'Model server offline' });
        }

        if (!flaskRes.ok) {
            const text = await flaskRes.text();
            return res.status(flaskRes.status).json({ error: `Model error: ${text}` });
        }

        const data = await flaskRes.json();

        // Save to MongoDB if available
        try {
            const db = getDb();
            if (db) {
                await db.collection('generations').insertOne({
                    formula,
                    ...data,
                    createdAt: new Date()
                });
            }
        } catch (dbErr) {
            console.error("MongoDB save failed (non-fatal):", dbErr);
        }

        res.json({
            formula,
            ...data
        });

    } catch (error) {
        console.error('Generate route error:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
