// controllers/reviewController.js
const db = require('../config/db');

// GET /api/products/:id/reviews
const getReviews = (req, res) => {
  const productId = req.params.id;
  console.log('➡️ Fetching reviews for product ID:', productId);

  db.query(
    'SELECT * FROM product_reviews WHERE product_id = ?',
    [productId],
    (err, rows) => {
      if (err) {
        console.error('❌ Error fetching reviews:', err);
        return res.status(500).json({ error: 'Failed to fetch reviews' });
      }
      console.log('✅ Reviews fetched:', rows.length);
      res.json(rows);
    }
  );
};

// POST /api/products/:id/reviews
const addReview = (req, res) => {
  const { user_name, rating, review } = req.body;
  const productId = req.params.id;
  const parsedRating = parseInt(rating, 10);

  if (isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5) {
    return res.status(400).json({ error: 'Invalid rating value' });
  }

  db.query(
    'INSERT INTO product_reviews (product_id, user_name, rating, review) VALUES (?, ?, ?, ?)',
    [productId, user_name, parsedRating, review],
    (err, result) => {
      if (err) {
        console.error('❌ Error inserting review:', err);
        return res.status(500).json({ error: 'Failed to submit review' });
      }
      console.log('✅ Review inserted with ID:', result.insertId);
      res.status(201).json({ message: 'Review submitted successfully' });
    }
  );
};

// POST /api/website/reviews
const addWebsiteReview = (req, res) => {
  const { user_name, rating, review } = req.body;
  const parsedRating = parseInt(rating, 10);

  if (!user_name || isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5 || !review) {
    return res.status(400).json({ error: 'Invalid input' });
  }

  db.query(
    'INSERT INTO website_reviews (user_name, rating, review) VALUES (?, ?, ?)',
    [user_name, parsedRating, review],
    (err, result) => {
      if (err) {
        console.error('❌ Error adding website review:', err);
        return res.status(500).json({ error: 'Failed to submit website review' });
      }
      res.status(201).json({ message: 'Website review submitted successfully' });
    }
  );
};

// GET /api/website/reviews
const getWebsiteReviews = (req, res) => {
  db.query('SELECT * FROM website_reviews ORDER BY created_at DESC', (err, rows) => {
    if (err) {
      console.error('❌ Error fetching website reviews:', err);
      return res.status(500).json({ error: 'Failed to fetch website reviews' });
    }
    res.json(rows);
  });
};

module.exports = {
  getReviews,
  addReview,
  addWebsiteReview,
  getWebsiteReviews
};

