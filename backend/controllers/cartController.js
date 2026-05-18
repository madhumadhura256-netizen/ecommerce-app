import Cart from "../models/Cart.js";
import Product from "../models/Product.js";

/* =========================
   ADD TO CART
========================= */
export const addToCart = async (req, res) => {
  try {
    console.log("BODY:", req.body);
    console.log("USER:", req.user);

    // 🔥 CHECK USER
    if (!req.user) {
      return res.status(401).json({
        message: "User not authorized",
      });
    }

    const user = req.user.id;

    const { product, quantity } = req.body;

    // 🔥 CHECK PRODUCT EXISTS
    const productExists = await Product.findById(product);

    if (!productExists) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    // 🔥 CHECK IF ALREADY IN CART
    const existingItem = await Cart.findOne({
      user,
      product,
    });

    if (existingItem) {
      existingItem.quantity += quantity || 1;

      await existingItem.save();

      return res.json(existingItem);
    }

    // 🔥 CREATE NEW ITEM
    const cartItem = await Cart.create({
      user,
      product,
      quantity: quantity || 1,
    });

    res.status(201).json(cartItem);

  } catch (error) {
    console.log("ADD TO CART ERROR:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};

/* =========================
   GET CART ITEMS
========================= */
export const getCartItems = async (req, res) => {
  try {
    const cartItems = await Cart.find({
      user: req.user.id,
    }).populate("product");

    res.json(cartItems);

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

/* =========================
   REMOVE ITEM
========================= */
export const removeCartItem = async (req, res) => {
  try {
    const item = await Cart.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        message: "Item not found",
      });
    }

    await item.deleteOne();

    res.json({
      message: "Item removed",
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

/* =========================
   UPDATE QUANTITY
========================= */
export const updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;

    const item = await Cart.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        message: "Item not found",
      });
    }

    item.quantity = quantity;

    await item.save();

    res.json(item);

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};