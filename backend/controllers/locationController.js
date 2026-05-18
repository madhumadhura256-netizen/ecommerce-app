import User from '../models/User.js';

// @desc    Reverse geocode (lat/lng → address) using a simple approach
// @route   POST /api/location/reverse-geocode
// @access  Private
export const reverseGeocode = async (req, res) => {
  const { lat, lng } = req.body;

  if (!lat || !lng) {
    res.status(400);
    throw new Error('Latitude and longitude are required');
  }

  // Use OpenStreetMap Nominatim (free, no API key)
  const nominatimUrl =
    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`;

  const response = await fetch(nominatimUrl, {
    headers: { 'User-Agent': 'ShopZen/1.0 (shopzen@example.com)' },
  });

  if (!response.ok) {
    res.status(502);
    throw new Error('Geocoding service unavailable');
  }

  const data = await response.json();
  const addr = data.address || {};

  const formatted = {
    street:  [addr.road, addr.house_number].filter(Boolean).join(' ') || addr.suburb || '',
    city:    addr.city || addr.town || addr.village || addr.county || '',
    state:   addr.state || '',
    pincode: addr.postcode || '',
    country: addr.country || 'India',
    full:    data.display_name || '',
  };

  res.json({ success: true, address: formatted, raw: data });
};

// @desc    Save current location to user address
// @route   POST /api/location/save
// @access  Private
export const saveLocation = async (req, res) => {
  const { lat, lng, label, street, city, state, pincode } = req.body;

  const user = await User.findById(req.user._id);

  const newAddress = {
    label:    label || 'Current Location',
    street:   street || 'Detected location',
    city:     city   || '',
    state:    state  || '',
    pincode:  pincode || '',
    isDefault: false,
    location: {
      type:        'Point',
      coordinates: [parseFloat(lng), parseFloat(lat)],
    },
  };

  user.addresses.push(newAddress);
  await user.save();

  res.status(201).json({ success: true, addresses: user.addresses });
};

// @desc    Estimate delivery for coordinates
// @route   POST /api/location/delivery-estimate
// @access  Public
export const deliveryEstimate = async (req, res) => {
  const { lat, lng } = req.body;

  if (!lat || !lng) {
    res.status(400);
    throw new Error('Location required');
  }

  // Simple logic: within-city = 2 days, otherwise 5 days
  // In production, integrate with a delivery/logistics API
  const estimate = {
    standard: { days: 5, label: '5-7 Business Days', free: false, cost: 49 },
    express:  { days: 2, label: '1-2 Business Days', free: false, cost: 99 },
    same_day: { days: 0, label: 'Same Day',           free: false, cost: 149 },
    serviceable: true,
  };

  res.json({ success: true, estimate });
};