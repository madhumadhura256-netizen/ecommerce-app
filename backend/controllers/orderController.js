import Order from '../models/Order.js';
import Product from '../models/Product.js';
import sendEmail, { orderConfirmationEmail } from '../utils/sendEmail.js';

const SHIPPING_THRESHOLD = 500; // Free shipping above ₹500
const SHIPPING_CHARGE    = 49;
const TAX_RATE           = 0.05; // 5% GST

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
export const createOrder = async (req, res) => {
  const { items, shippingAddress, paymentMethod, notes } = req.body;

  if (!items?.length) {
    res.status(400);
    throw new Error('No order items');
  }

  // Verify stock and get current prices
  const enrichedItems = await Promise.all(
    items.map(async (item) => {
      const product = await Product.findById(item.product);
      if (!product || !product.isActive) {
        throw new Error(`Product "${item.name || item.product}" not found`);
      }
      if (product.stock < item.quantity) {
        throw new Error(`Insufficient stock for "${product.name}". Available: ${product.stock}`);
      }
      return {
        product:  product._id,
        name:     product.name,
        image:    product.images[0] || '',
        price:    product.discount > 0
          ? Math.round(product.price * (1 - product.discount / 100))
          : product.price,
        quantity: item.quantity,
        unit:     product.unit,
      };
    })
  );

  const itemsPrice    = enrichedItems.reduce((acc, i) => acc + i.price * i.quantity, 0);
  const shippingPrice = itemsPrice >= SHIPPING_THRESHOLD ? 0 : SHIPPING_CHARGE;
  const taxPrice      = Math.round(itemsPrice * TAX_RATE);
  const totalPrice    = itemsPrice + shippingPrice + taxPrice;

  const estimatedDelivery = new Date();
  estimatedDelivery.setDate(estimatedDelivery.getDate() + (paymentMethod === 'cod' ? 5 : 3));

  const order = await Order.create({
    user: req.user._id,
    items: enrichedItems,
    shippingAddress,
    paymentMethod: paymentMethod || 'cod',
    itemsPrice,
    shippingPrice,
    taxPrice,
    totalPrice,
    notes,
    estimatedDelivery,
    trackingUpdates: [{
      status:  'placed',
      message: 'Your order has been placed successfully!',
    }],
  });

  // Decrement stock
  await Promise.all(
    enrichedItems.map((item) =>
      Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } })
    )
  );

  // Send confirmation email (non-blocking)
  sendEmail(orderConfirmationEmail(order, req.user)).catch(console.error);

  res.status(201).json({ success: true, order });
};

// @desc    Get logged-in user's orders
// @route   GET /api/orders/mine
// @access  Private
export const getMyOrders = async (req, res) => {
  const page  = Number(req.query.page)  || 1;
  const limit = Number(req.query.limit) || 10;
  const skip  = (page - 1) * limit;

  const [orders, total] = await Promise.all([
    Order.find({ user: req.user._id })
      .sort('-createdAt')
      .skip(skip)
      .limit(limit)
      .populate('items.product', 'name images'),
    Order.countDocuments({ user: req.user._id }),
  ]);

  res.json({ success: true, orders, page, pages: Math.ceil(total / limit), total });
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('user', 'name email phone')
    .populate('items.product', 'name images');

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  // Allow only owner or admin
  if (order.user._id.toString() !== req.user._id.toString() && !req.user.isAdmin) {
    res.status(403);
    throw new Error('Not authorized to view this order');
  }

  res.json({ success: true, order });
};

// @desc    Update order status (admin)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
export const updateOrderStatus = async (req, res) => {
  const { status, message, location } = req.body;

  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  order.orderStatus = status;
  order.trackingUpdates.push({
    status,
    message: message || `Order status updated to ${status}`,
    location,
  });

  if (status === 'delivered') {
    order.isDelivered = true;
    order.deliveredAt = new Date();
  }

  await order.save();
  res.json({ success: true, order });
};

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
export const cancelOrder = async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  if (order.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized');
  }

  if (['shipped', 'out_for_delivery', 'delivered'].includes(order.orderStatus)) {
    res.status(400);
    throw new Error('Cannot cancel order at this stage');
  }

  order.orderStatus       = 'cancelled';
  order.cancellationReason = req.body.reason || 'Cancelled by user';
  order.trackingUpdates.push({
    status:  'cancelled',
    message: `Order cancelled: ${order.cancellationReason}`,
  });

  // Restore stock
  await Promise.all(
    order.items.map((item) =>
      Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } })
    )
  );

  await order.save();
  res.json({ success: true, order });
};

// @desc    Pay order (Stripe)
// @route   PUT /api/orders/:id/pay
// @access  Private
export const payOrder = async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  order.isPaid        = true;
  order.paidAt        = new Date();
  order.paymentResult = {
    id:         req.body.id,
    status:     req.body.status,
    updateTime: req.body.update_time,
    email:      req.body.payer?.email_address,
  };
  order.trackingUpdates.push({
    status:  'confirmed',
    message: 'Payment received. Order confirmed!',
  });
  order.orderStatus = 'confirmed';

  await order.save();
  res.json({ success: true, order });
};

// @desc    Get all orders (admin)
// @route   GET /api/orders
// @access  Private/Admin
export const getAllOrders = async (req, res) => {
  const page   = Number(req.query.page)   || 1;
  const limit  = Number(req.query.limit)  || 20;
  const status = req.query.status;
  const skip   = (page - 1) * limit;

  const query = status ? { orderStatus: status } : {};

  const [orders, total] = await Promise.all([
    Order.find(query)
      .populate('user', 'name email')
      .sort('-createdAt')
      .skip(skip)
      .limit(limit),
    Order.countDocuments(query),
  ]);

  res.json({ success: true, orders, page, pages: Math.ceil(total / limit), total });
};