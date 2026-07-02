import express from 'express';
import { handleChat } from '../controllers/chatController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import creditMiddleware from '../middlewares/creditMiddleware.js';

const router = express.Router();

router.post('/', authMiddleware, creditMiddleware, handleChat);

export default router;