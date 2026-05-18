import User from '../models/User.js';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
export const getProfile = async (req, res) => {
  const user = await User.findById(req.user._id);
  res.json({ success: true, user });
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateProfile = async (req, res) => {
  const user = await User.findById(req.user._id);

  user.name  = req.body.name  || user.name;
  user.phone = req.body.phone || user.phone;

  if (req.body.password) {
    if (req.body.password.length < 6) {
      res.status(400);
      throw new Error('Password must be at least 6 characters');
    }
    user.password = req.body.password;
  }

  const updated = await user.save();
  res.json({ success: true, user: updated });
};

// @desc    Upload avatar
// @route   PUT /api/users/avatar
// @access  Private
export const uploadAvatar = async (req, res) => {
  if (!req.body.image) {
    res.status(400);
    throw new Error('No image provided');
  }

  const result = await cloudinary.uploader.upload(req.body.image, {
    folder:         'shopzen/avatars',
    width:          300,
    height:         300,
    crop:           'fill',
    gravity:        'face',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
  });

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { avatar: result.secure_url },
    { new: true }
  );

  res.json({ success: true, avatar: user.avatar });
};

// @desc    Add address
// @route   POST /api/users/addresses
// @access  Private
export const addAddress = async (req, res) => {
  const user = await User.findById(req.user._id);

  const newAddress = req.body;

  // If this is set as default, unset others
  if (newAddress.isDefault) {
    user.addresses.forEach((addr) => { addr.isDefault = false; });
  }

  // First address auto-default
  if (user.addresses.length === 0) newAddress.isDefault = true;

  user.addresses.push(newAddress);
  await user.save();

  res.status(201).json({ success: true, addresses: user.addresses });
};

// @desc    Update address
// @route   PUT /api/users/addresses/:id
// @access  Private
export const updateAddress = async (req, res) => {
  const user = await User.findById(req.user._id);
  const address = user.addresses.id(req.params.id);

  if (!address) {
    res.status(404);
    throw new Error('Address not found');
  }

  if (req.body.isDefault) {
    user.addresses.forEach((addr) => { addr.isDefault = false; });
  }

  Object.assign(address, req.body);
  await user.save();

  res.json({ success: true, addresses: user.addresses });
};

// @desc    Delete address
// @route   DELETE /api/users/addresses/:id
// @access  Private
export const deleteAddress = async (req, res) => {
  const user = await User.findById(req.user._id);
  user.addresses = user.addresses.filter(
    (addr) => addr._id.toString() !== req.params.id
  );
  await user.save();
  res.json({ success: true, addresses: user.addresses });
};

// @desc    Get all users (admin)
// @route   GET /api/users
// @access  Private/Admin
export const getAllUsers = async (req, res) => {
  const page  = Number(req.query.page)  || 1;
  const limit = Number(req.query.limit) || 20;
  const skip  = (page - 1) * limit;

  const [users, total] = await Promise.all([
    User.find({}).select('-password').skip(skip).limit(limit).sort('-createdAt'),
    User.countDocuments(),
  ]);

  res.json({ success: true, users, page, pages: Math.ceil(total / limit), total });
};