import Feedback from '../models/Feedback.js';
import jwt from 'jsonwebtoken';

export const submitFeedback = async (req, res) => {
    try {
        const { name, email, type, message, page } = req.body;

        if (!message || message.trim().length < 5) {
            return res.status(400).json({ error: 'Message must be at least 5 characters.' });
        }

        let userId = null;
        try {
            const authHeader = req.headers.authorization || '';
            if (authHeader.startsWith('Bearer ')) {
                const token = authHeader.split(' ')[1];
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                userId = decoded?.id || null;
            }
        } catch (_) {}

        const feedback = await Feedback.create({
            userId,
            name: name?.trim() || 'Anonymous',
            email: email?.trim() || '',
            type: type || 'feedback',
            message: message.trim(),
            page: page || ''
        });

        return res.status(201).json({ success: true, id: feedback._id });
    } catch (err) {
        return res.status(500).json({ error: 'Failed to submit feedback.' });
    }
};

export const getAllFeedback = async (req, res) => {
    try {
        const { status, type, limit = 100 } = req.query;
        const filter = {};
        if (status) filter.status = status;
        if (type) filter.type = type;

        const feedbacks = await Feedback.find(filter)
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .populate('userId', 'username email');

        const counts = await Feedback.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);

        const typeCounts = await Feedback.aggregate([
            { $group: { _id: '$type', count: { $sum: 1 } } }
        ]);

        return res.status(200).json({ feedbacks, counts, typeCounts });
    } catch (err) {
        return res.status(500).json({ error: 'Failed to fetch feedback.' });
    }
};

export const updateFeedbackStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        if (!['new', 'read', 'resolved'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status.' });
        }
        await Feedback.findByIdAndUpdate(id, { status });
        return res.status(200).json({ success: true });
    } catch (err) {
        return res.status(500).json({ error: 'Failed to update status.' });
    }
};
