import socketLog from '../../models/logger/socket.js';

/*
 * Store client logs in database
 */
export const storeClientLog = async (req, res) => {
    try {
        const logData = {
            ...req.body,
            clientIP: req.ip,
            sessionId: req.sessionID,
            serverTimestamp: new Date()
        };
        
        // Store in database
        await socketLog.create(logData);
        
        // Log critical errors to console for immediate visibility
        if (logData.level === 'error') {
            console.error('CRITICAL CLIENT ERROR:', JSON.stringify(logData, null, 2));
        }
        
        res.json({ status: 'logged' });
    } catch (error) {
        console.error('Failed to store client log:', error);
        res.status(500).json({ error: 'Logging failed' });
    }
};