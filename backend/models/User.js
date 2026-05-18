import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const addressSchema = new mongoose.Schema({
  label:    { type: String, default: 'Home' },
  street:   { type: String, required: true },
  city:     { type: String, required: true },
  state:    { type: String, required: true },
  pincode:  { type: String, required: true },
  country:  { type: String, default: 'India' },
  isDefault: { type: Boolean, default: false },
  location: {
    type:        { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] }, // [lng, lat]
  },
});

const userSchema = new mongoose.Schema(
  {
    name:     { type: String, required: [true, 'Name is required'], trim: true, maxlength: 60 },
    email:    { type: String, required: [true, 'Email is required'], unique: true, lowercase: true, trim: true,
                match: [/^\S+@\S+\.\S+$/, 'Invalid email format'] },
    password: { type: String, required: [true, 'Password is required'], minlength: [6, 'Min 6 characters'] },
    phone:    { type: String, match: [/^[0-9]{10}$/, 'Invalid phone number'] },
    avatar:   { type: String, default: '' },
    addresses: [addressSchema],
    isAdmin:  { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
    resetPasswordToken:   String,
    resetPasswordExpire:  Date,
  },
  { timestamps: true }
);

addressSchema.index({ location: '2dsphere' });

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare passwords
userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

// Remove password from JSON output
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.resetPasswordToken;
  delete obj.resetPasswordExpire;
  return obj;
};

export default mongoose.model('User', userSchema);