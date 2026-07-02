import express from 'express';
import { checkVin, checkPlate, checkIndianPlate } from '../controllers/vinController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import creditMiddleware from '../middlewares/creditMiddleware.js';

const router = express.Router();

router.get('/decode/:vin', authMiddleware, creditMiddleware, checkVin);
router.get('/plate', authMiddleware, creditMiddleware, checkPlate);
router.get('/indian-plate', authMiddleware, creditMiddleware, checkIndianPlate);

export default router;