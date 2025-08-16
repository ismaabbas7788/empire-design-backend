const db = require("../config/db"); // Your correct DB import

// backend/controller/cartController.js
let cart = []; // We'll use a temporary in-memory cart for now

exports.getCart = async (req, res) => {
  try {
    res.json(cart);
  } catch (error) {
    console.error("Error getting cart:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.addToCart = async (req, res) => {
  try {
    const { id, name, price, image, quantity } = req.body;

    const existingItem = cart.find((item) => item.id === id);

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.push({ id, name, price, image, quantity });
    }

    res.json({ message: "Product added to cart", cart });
  } catch (error) {
    console.error("Error adding to cart:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.updateQuantity = async (req, res) => {
  try {
    const { id, quantity } = req.body;

    cart = cart.map((item) => {
      if (item.id === id) {
        item.quantity = quantity;
      }
      return item;
    });

    res.json({ message: "Quantity updated", cart });
  } catch (error) {
    console.error("Error updating quantity:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.removeFromCart = async (req, res) => {
  try {
    const { id } = req.params;
    cart = cart.filter((item) => item.id !== id);
    res.json({ message: "Item removed", cart });
  } catch (error) {
    console.error("Error removing from cart:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.clearCart = async (req, res) => {
  try {
    cart = [];
    res.json({ message: "Cart cleared" });
  } catch (error) {
    console.error("Error clearing cart:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
