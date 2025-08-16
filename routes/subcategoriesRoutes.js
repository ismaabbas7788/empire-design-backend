const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET all subcategories with their category names
router.get('/', (req, res) => {
  const query = `
    SELECT subcategories.id, subcategories.name AS subcategory_name, categories.name AS category_name
    FROM subcategories
    JOIN categories ON subcategories.category_id = categories.id
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching subcategories:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    res.json(results);
  });
});

// ADD  a new subcategory
router.post('/', (req, res) => {
  const { name, category_id } = req.body;
  console.log('Incoming POST:', req.body); // Debug

  const query = 'INSERT INTO subcategories (name, category_id) VALUES (?, ?)';
  db.query(query, [name, category_id], (err, result) => {
    if (err) {
      console.error('Error inserting subcategory:', err);
      return res.status(500).json({ error: 'Database insert failed' });
    }
    res.status(201).json({ message: 'Subcategory added' });
  });
});
//Update
router.put('/:id', (req, res) => {
  const subcategoryId = req.params.id;
  const { name, category_id } = req.body;

  const query = 'UPDATE subcategories SET name = ?, category_id = ? WHERE id = ?';
  db.query(query, [name, category_id, subcategoryId], (err, result) => {
    if (err) {
      console.error('Error updating subcategory:', err);
      return res.status(500).json({ error: 'Database update failed' });
    }
    res.json({ message: 'Subcategory updated' });
  });
});
//Delete
router.delete('/:id', (req, res) => {
  const subcategoryId = req.params.id;

  const query = 'DELETE FROM subcategories WHERE id = ?';
  db.query(query, [subcategoryId], (err, result) => {
    if (err) {
      console.error('Error deleting subcategory:', err);
      return res.status(500).json({ error: 'Database delete failed' });
    }
    res.json({ message: 'Subcategory deleted' });
  });
});


module.exports = router;
