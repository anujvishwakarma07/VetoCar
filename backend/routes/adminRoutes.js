import express from 'express';
import jwt from 'jsonwebtoken';
import { getTrafficStats } from '../controllers/adminController.js';
import { getAllFeedback, updateFeedbackStatus } from '../controllers/feedbackController.js';
import Traffic from '../models/Traffic.js';

const router = express.Router();

const adminGuard = (req, res, next) => {
    const authHeader = req.headers.authorization || '';
    if (!authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Admin token required' });
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.ADMIN_JWT_SECRET);
        if (decoded.role !== 'admin') {
            return res.status(403).json({ error: 'Not an admin token' });
        }
        req.admin = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Invalid or expired admin token' });
    }
};

router.post('/login', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password required' });
    }
    if (
        username !== process.env.ADMIN_USERNAME ||
        password !== process.env.ADMIN_PASSWORD
    ) {
        return res.status(401).json({ error: 'Invalid admin credentials' });
    }
    const token = jwt.sign(
        { username, role: 'admin' },
        process.env.ADMIN_JWT_SECRET,
        { expiresIn: '8h' }
    );
    return res.status(200).json({ token, username });
});

router.get('/stats', adminGuard, getTrafficStats);

// DELETE all traffic logs — keeps Users & Contracts untouched
router.delete('/clear-traffic', adminGuard, async (req, res) => {
    try {
        const result = await Traffic.deleteMany({});
        return res.status(200).json({
            success: true,
            deleted: result.deletedCount,
            message: `Cleared ${result.deletedCount} traffic records. Fresh logging starts now.`
        });
    } catch (err) {
        return res.status(500).json({ error: 'Failed to clear traffic data' });
    }
});

router.get('/feedback', adminGuard, getAllFeedback);
router.patch('/feedback/:id/status', adminGuard, updateFeedbackStatus);

export default router;

