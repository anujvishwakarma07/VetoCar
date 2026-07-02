import User from "../models/User.js";

const creditMiddleware = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Determine credit cost dynamically based on URL path
        let cost = 1;
        const url = req.originalUrl || '';

        if (url.includes('/contracts/upload')) {
            cost = 15;
        } else if (url.includes('/vin/decode/')) {
            cost = 5;
        } else if (url.includes('/vin/plate') || url.includes('/vin/indian-plate')) {
            cost = 8;
        } else if (url.includes('/chat')) {
            cost = 1;
        }

        if (!user.credits || user.credits < cost) {
            return res.status(402).json({
                error: `Insufficient credits. This operation requires ${cost} credits, but you only have ${user.credits || 0}.`,
                code: 'INSUFFICIENT_CREDITS',
                requiredCredits: cost
            });
        }

        // Decrement cost
        user.credits = user.credits - cost;
        
        if (url.includes('/vin/decode/') || url.includes('/vin/plate') || url.includes('/vin/indian-plate')) {
            user.lookupsCount = (user.lookupsCount || 0) + 1;
        }

        await user.save();

        next();
    } catch (error) {
        console.error('Credit verification error:', error);
        return res.status(500).json({ error: 'Internal server check error during credit audit' });
    }
};

export default creditMiddleware;
