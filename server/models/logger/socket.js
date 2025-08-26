import mongoose from 'mongoose';

const socketLogSchema = new mongoose.Schema({
    level: { type: String, required: true, index: true },
    message: { type: String, required: true },
    data: { type: mongoose.Schema.Types.Mixed },
    timestamp: { type: Date, default: Date.now, index: true },
    userId: { type: String, index: true },
    sessionId: String,
    userAgent: String,
    clientIP: String,
    socketId: String,
    url: String
}, {
    // Auto-delete logs older than 30 days
    expireAfterSeconds: 10 * 24 * 60 * 60
});

// Compound indexes for common queries
socketLogSchema.index({ level: 1, timestamp: -1 });
socketLogSchema.index({ userId: 1, timestamp: -1 });
socketLogSchema.index({ 'data.reason': 1, level: 1 });

export default mongoose.model('socketLog', socketLogSchema);
