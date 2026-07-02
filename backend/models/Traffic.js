import mongoose from 'mongoose';

const trafficSchema = new mongoose.Schema({
    ip: { type: String, default: 'unknown' },
    method: { type: String, default: 'GET' },
    route: { type: String, default: '/' },
    statusCode: { type: Number, default: 200 },
    responseTime: { type: Number, default: 0 },
    userAgent: { type: String, default: '' },
    device: { type: String, default: 'desktop', enum: ['mobile', 'tablet', 'desktop'] },
    browser: { type: String, default: 'unknown' },
    os: { type: String, default: 'unknown' },
    country: { type: String, default: 'Unknown' },
    city: { type: String, default: 'Unknown' },
    region: { type: String, default: '' },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    timestamp: { type: Date, default: Date.now }
});

trafficSchema.index({ timestamp: -1 });
trafficSchema.index({ ip: 1 });
trafficSchema.index({ route: 1 });

export default mongoose.model('Traffic', trafficSchema);
