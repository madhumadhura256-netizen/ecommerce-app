import Wishlist from '../models/Wishlist.js';
import Product from '../models/Product.js';

// @desc    Get user wishlist
// @route   GET /api/wishlist
// @access  Private
export const getWishlist = async (req, res) => {
  let wishlist = await Wishlist.findOne({ user: req.user._id })
    .populate('products.product', 'name price discount images category brand stock ratings');

  if (!wishlist) {
    wishlist = await Wishlist.create({ user: req.user._id, products: [] });
  }

  res.json({ success: true, wishlist });
};

// @desc    Add product to wishlist
// @route   POST /api/wishlist
// @access  Private
export const addToWishlist = async (req, res) => {
  const { productId } = req.body;

  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  let wishlist = await Wishlist.findOne({ user: req.user._id });
  if (!wishlist) {
    wishlist = await Wishlist.create({ user: req.user._id, products: [] });
  }

  const alreadyExists = wishlist.products.some(
    (p) => p.product.toString() === productId
  );

  if (alreadyExists) {
    return res.json({ success: true, message: 'Already in wishlist', wishlist });
  }

  wishlist.products.push({ product: productId });
  await wishlist.save();
  await wishlist.populate('products.product', 'name price discount images category brand stock ratings');

  res.status(201).json({ success: true, message: 'Added to wishlist', wishlist });
};

// @desc    Remove product from wishlist
// @route   DELETE /api/wishlist/:productId
// @access  Private
export const removeFromWishlist = async (req, res) => {
  const wishlist = await Wishlist.findOne({ user: req.user._id });

  if (!wishlist) {
    res.status(404);
    throw new Error('Wishlist not found');
  }

  wishlist.products = wishlist.products.filter(
    (p) => p.product.toString() !== req.params.productId
  );

  await wishlist.save();
  await wishlist.populate('products.product', 'name price discount images category brand stock ratings');

  res.json({ success: true, message: 'Removed from wishlist', wishlist });
};

// @desc    Clear wishlist
// @route   DELETE /api/wishlist
// @access  Private
export const clearWishlist = async (req, res) => {
  await Wishlist.findOneAndUpdate(
    { user: req.user._id },
    { products: [] },
    { new: true }
  );
  res.json({ success: true, message: 'Wishlist cleared' });
};