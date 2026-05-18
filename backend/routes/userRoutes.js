import express from 'express';
import {
  getProfile, updateProfile, uploadAvatar,
  addAddress, updateAddress, deleteAddress, getAllUsers,
} from '../controllers/userController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/profile',          protect, getProfile);
router.put('/profile',          protect, updateProfile);
router.put('/avatar',           protect, uploadAvatar);
router.post('/addresses',       protect, addAddress);
router.put('/addresses/:id',    protect, updateAddress);
router.delete('/addresses/:id', protect, deleteAddress);

// Admin
router.get('/', protect, admin, getAllUsers);

export default router;