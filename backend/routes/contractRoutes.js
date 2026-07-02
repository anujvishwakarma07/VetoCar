import express from 'express';
import upload from '../middlewares/uploadMiddleware.js';
import { deleteContract, getContracts, uploadContent } from '../controllers/contractController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import creditMiddleware from '../middlewares/creditMiddleware.js';

const router = express.Router();
router.post('/upload', authMiddleware, creditMiddleware, upload.single('contract'), uploadContent);
router.get('/', authMiddleware, getContracts);
router.delete('/:id', authMiddleware, deleteContract);

export default router;
