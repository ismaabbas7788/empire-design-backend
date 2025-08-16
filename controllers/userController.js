const db = require('../config/db');

// Get all registered users with dynamic columns
const getUsers = (req, res) => {
  const sql = 'SELECT * FROM register';
  db.query(sql, (err, results, fields) => {
    if (err) {
      console.error('Error fetching registered users:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    // Extract column names from the fields metadata
    const columns = fields.map(field => field.name);
    res.status(200).json({ columns, users: results });
  });
};

module.exports = {
  getUsers,
};
