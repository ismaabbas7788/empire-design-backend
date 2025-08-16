const express = require('express');
const { getReviews, addReview,addWebsiteReview,  getWebsiteReviews} = require('../controllers/reviewController');
const router = express.Router();

// Get reviews for a product
router.get('/products/:id/reviews', getReviews);

// Add a review for a product
router.post('/products/:id/reviews', addReview);

router.get('/website/reviews', getWebsiteReviews);
router.post('/website/reviews', addWebsiteReview);

module.exports = router;
