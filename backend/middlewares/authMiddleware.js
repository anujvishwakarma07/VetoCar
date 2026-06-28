import jwt from 'jsonwebtoken';

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer')) {
        return res.status(401).json({ error: 'Access denied. No token Provided.' });
    }

    const token = authHeader.split(' ')[1];
    try {
        const jwtSecret = process.env.JWT_SECRET;
        const decoded = jwt.verify(token, jwtSecret);

        req.user = decoded;
        next();
    } catch (error) {
        console.error('JWT Verification Error :', error);
        return res.status(401).json({
            error : 'Access Denied. Invalid or expired token'
        });
    }
};

export default authMiddleware;