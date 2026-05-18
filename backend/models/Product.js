import mongoose from "mongoose";

const CATEGORIES = [
  "fruits",
  "vegetables",
  "beauty",
  "clothes",
  "electronics",
  "shoes",
  "snacks",
  "chocolates",
  "groceries",
  "beverages",
  "dairy",
  "other",
];

// ---------------- REVIEW SCHEMA ----------------
const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    avatar: String,
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, maxlength: 500 },
  },
  { timestamps: true }
);

// ---------------- PRODUCT SCHEMA ----------------
const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    mrp: { type: Number, min: 0 },
    discount: { type: Number, default: 0, min: 0, max: 100 },

    images: { type: [String], default: [] },

    category: {
      type: String,
      required: true,
      enum: CATEGORIES,
      index: true,
    },

    subcategory: String,
    brand: String,
    unit: { type: String, default: "piece" },

    stock: { type: Number, default: 0, min: 0 },

    sku: { type: String, unique: true, sparse: true },

    tags: [String],

    ratings: { type: Number, default: 0, min: 0, max: 5 },
    numReviews: { type: Number, default: 0 },

    reviews: [reviewSchema],

    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },

    weight: Number,

    dimensions: {
      length: Number,
      width: Number,
      height: Number,
    },
  },
  { timestamps: true }
);

// ---------------- INDEXES ----------------
productSchema.index({
  name: "text",
  description: "text",
  tags: "text",
  brand: "text",
});

productSchema.index({ category: 1, isActive: 1, price: 1 });

// ---------------- VIRTUAL ----------------
productSchema.virtual("finalPrice").get(function () {
  return this.discount > 0
    ? Math.round(this.price * (1 - this.discount / 100))
    : this.price;
});

// ---------------- METHODS ----------------
productSchema.methods.calcAverageRatings = function () {
  if (!this.reviews.length) {
    this.ratings = 0;
    this.numReviews = 0;
    return;
  }

  this.numReviews = this.reviews.length;

  this.ratings =
    this.reviews.reduce((acc, r) => acc + r.rating, 0) / this.numReviews;

  this.ratings = +this.ratings.toFixed(1);
};

// ---------------- MIDDLEWARE ----------------
productSchema.pre("save", function (next) {
  if (!this.sku) {
    this.sku = `SKU-${Date.now()}`;
  }
  next();
});

// ---------------- EXPORT ----------------
export const PRODUCT_CATEGORIES = CATEGORIES;
export default mongoose.model("Product", productSchema);