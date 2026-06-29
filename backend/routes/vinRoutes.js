import express from 'express';
import { checkVin, checkPlate, checkIndianPlate } from '../controllers/vinController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/decode/:vin', authMiddleware, checkVin);
router.get('/plate', authMiddleware, checkPlate);
router.get('/indian-plate', authMiddleware, checkIndianPlate);

export default router;