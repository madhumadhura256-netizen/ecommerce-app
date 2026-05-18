import express from 'express';
import {
  getProducts, getProductById, createProduct,
  updateProduct, deleteProduct, addReview, getCategories,
} from '../controllers/productController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/categories', getCategories);
router.get('/',           getProducts);
router.get('/:id',        getProductById);
router.get("/", async (req, res) => {
  try {
    const category = req.query.category;

    let filter = {};

    if (category && category !== "all") {
      filter.category = category.toLowerCase();
    }

    const products = await Product.find(filter);

    res.json({ products });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.post('/:id/reviews', protect, addReview);

// Admin
router.post('/',    protect, admin, createProduct);
router.put('/:id',  protect, admin, updateProduct);
router.delete('/:id', protect, admin, deleteProduct);

export default router;