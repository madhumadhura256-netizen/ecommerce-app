import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    name:        { type: String, required: true, unique: true, lowercase: true },
    displayName: { type: String, required: true },
    icon:        { type: String, default: '🛍️' },
    image:       String,
    description: String,
    isActive:    { type: Boolean, default: true },
    sortOrder:   { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model('Category', categorySchema);