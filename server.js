// server.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const categoryRoutes = require('./routes/categoryRoutes');
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');  // Correct path to your orderRoutes.js file
const profileRoutes = require('./routes/profileRoutes');  // 👈 New profile route
const reviewRoutes = require('./routes/reviewRoutes'); // Adjust path as needed
const historyRoutes = require('./routes/historyRoutes');
const searchRoutes = require('./routes/searchRoutes');
const registerRoutes = require('./routes/userRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const contactRoutes = require("./routes/contactRoutes");
const subcategoriesRoutes = require('./routes/subcategoriesRoutes');




const app = express();
const PORT = 5000;
app.use('/uploads', express.static('uploads')); // To serve profile images


const path = require('path');
app.use('/images', express.static(path.join(__dirname, '../public/images')));

app.use(cors({
  origin: 'http://localhost:3000', // Your React app
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
app.use(bodyParser.json());


// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);  // Use the routes under '/api/orders'
app.use('/api/profile', profileRoutes);  // 👈 Use the route
app.use('/api', reviewRoutes); // Make sure this matches with your frontend API call
app.use('/api', historyRoutes);
app.use('/api', searchRoutes);
app.use('/api/register', registerRoutes);
app.use('/api/subcategories', subcategoriesRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use("/api/contact", require("./routes/contactRoutes"));



app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
