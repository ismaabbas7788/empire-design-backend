const db = require('../config/db'); // Your correct DB import

// backend/controller/cartController.js
let cart = []; // We'll use a temporary in-memory cart for now

exports.getCart = (req, res) => {
  res.json(cart);
};

exports.addToCart = (req, res) => {
  const { id, name, price, image, quantity } = req.body;

  const existingItem = cart.find(item => item.id === id);

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.push({ id, name, price, image, quantity });
  }

  res.json({ message: 'Product added to cart', cart });
};

exports.updateQuantity = (req, res) => {
  const { id, quantity } = req.body;

  cart = cart.map(item => {
    if (item.id === id) {
      item.quantity = quantity;
    }
    return item;
  });

  res.json({ message: 'Quantity updated', cart });
};

exports.removeFromCart = (req, res) => {
  const { id } = req.params;
  cart = cart.filter(item => item.id !== id);
  res.json({ message: 'Item removed', cart });
};

exports.clearCart = (req, res) => {
  cart = [];
  res.json({ message: 'Cart cleared' });
};
