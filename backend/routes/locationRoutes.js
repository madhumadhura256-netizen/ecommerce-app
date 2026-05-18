import express from 'express';
import { reverseGeocode, saveLocation, deliveryEstimate } from '../controllers/locationController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/reverse-geocode',    protect, reverseGeocode);
router.post('/save',               protect, saveLocation);
router.post('/delivery-estimate',  deliveryEstimate);

export default router;