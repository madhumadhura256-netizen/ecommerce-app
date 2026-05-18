import express from 'express';
import {
  createOrder, getMyOrders, getOrderById,
  updateOrderStatus, cancelOrder, payOrder, getAllOrders,
} from '../controllers/orderController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/',           protect, createOrder);
router.get('/mine',        protect, getMyOrders);
router.get('/:id',         protect, getOrderById);
router.put('/:id/pay',     protect, payOrder);
router.put('/:id/cancel',  protect, cancelOrder);

// Admin
router.get('/',               protect, admin, getAllOrders);
router.put('/:id/status',     protect, admin, updateOrderStatus);

export default router;