import express from 'express';
import { registerUser, loginUser, getUserProfile, changePassword } from '../controllers/AuthController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', authMiddleware, getUserProfile);
router.post('/change-password', authMiddleware, changePassword);

export default router;
