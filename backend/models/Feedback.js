import mongoose from 'mongoose';

const FeedbackSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    name: { type: String, default: 'Anonymous' },
    email: { type: String, default: '' },
    type: { type: String, enum: ['bug', 'feedback', 'query'], default: 'feedback' },
    message: { type: String, required: true },
    page: { type: String, default: '' },
    status: { type: String, enum: ['new', 'read', 'resolved'], default: 'new' },
    createdAt: { type: Date, default: Date.now }
});

const Feedback = mongoose.model('Feedback', FeedbackSchema);
export default Feedback;
