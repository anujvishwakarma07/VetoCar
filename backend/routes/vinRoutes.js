import express from 'express';
import { checkVin } from '../controllers/vinController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/decode/:vin', authMiddleware, checkVin);

export default router;