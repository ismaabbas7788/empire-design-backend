// server.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

// Import routes
const categoryRoutes = require('../routes/categoryRoutes');
const authRoutes = require('../routes/authRoutes');
const productRoutes = require('../routes/productRoutes');
const cartRoutes = require('../routes/cartRoutes');
const orderRoutes = require('../routes/orderRoutes');
const profileRoutes = require('../routes/profileRoutes');
const reviewRoutes = require('../routes/reviewRoutes');
const historyRoutes = require('../routes/historyRoutes');
const searchRoutes = require('../routes/searchRoutes');
const registerRoutes = require('../routes/userRoutes');
const analyticsRoutes = require('../routes/analyticsRoutes');
const contactRoutes = require("../routes/contactRoutes");
const subcategoriesRoutes = require('../routes/subcategoriesRoutes');

const app = express();

// Serve static files
app.use('/uploads', express.static('uploads'));
app.use('/images', express.static(path.join(__dirname, '../public/images')));

// Middleware
app.use(cors({
  origin: '*',   // change to your frontend domain on production
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
app.use(bodyParser.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api', reviewRoutes);
app.use('/api', historyRoutes);
app.use('/api', searchRoutes);
app.use('/api/register', registerRoutes);
app.use('/api/subcategories', subcategoriesRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/contact', contactRoutes);

// ❌ Don't use app.listen()
// ✅ Instead export the app (Vercel will handle it)
// module.exports = app;

app.listen(5000, () => {
  console.log(`Server running at http://localhost:${5000}`);
});
