import mongoose from 'mongoose';

const ORDER_STATUSES = [
  'placed', 'confirmed', 'packed',
  'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'refunded'
];

const orderItemSchema = new mongoose.Schema({
  product:   { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name:      { type: String, required: true },
  image:     String,
  price:     { type: Number, required: true },
  quantity:  { type: Number, required: true, min: 1 },
  unit:      String,
});

const trackingSchema = new mongoose.Schema({
  status:    { type: String, required: true },
  message:   { type: String, required: true },
  location:  String,
  timestamp: { type: Date, default: Date.now },
});

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    orderNumber: { type: String, unique: true },
    items:        { type: [orderItemSchema], required: true },
    shippingAddress: {
      label:    String,
      street:   { type: String, required: true },
      city:     { type: String, required: true },
      state:    { type: String, required: true },
      pincode:  { type: String, required: true },
      country:  { type: String, default: 'India' },
      phone:    String,
      location: {
        type:        { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], default: [0, 0] },
      },
    },
    paymentMethod:  { type: String, enum: ['stripe', 'cod', 'upi'], default: 'cod' },
    paymentResult:  {
      id:            String,
      status:        String,
      updateTime:    String,
      email:         String,
    },
    itemsPrice:    { type: Number, required: true },
    shippingPrice: { type: Number, default: 0 },
    taxPrice:      { type: Number, default: 0 },
    totalPrice:    { type: Number, required: true },
    isPaid:        { type: Boolean, default: false },
    paidAt:        Date,
    isDelivered:   { type: Boolean, default: false },
    deliveredAt:   Date,
    estimatedDelivery: Date,
    orderStatus:   { type: String, enum: ORDER_STATUSES, default: 'placed', index: true },
    trackingUpdates: [trackingSchema],
    cancellationReason: String,
    notes:         String,
  },
  { timestamps: true }
);

// Auto-generate order number
orderSchema.pre('save', async function (next) {
  if (!this.orderNumber) {
    const count = await mongoose.model('Order').countDocuments();
    this.orderNumber = `SZ${Date.now().toString().slice(-6)}${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

export default mongoose.model('Order', orderSchema);