import express from 'express';
import upload from '../middlewares/uploadMiddleware.js';
import { uploadContent } from '../controllers/contractController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();
router.post('/upload', authMiddleware, upload.single('contract'), uploadContent);

export default router;
