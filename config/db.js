const mysql = require('mysql2'); // ✅ must be mysql2

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'ardb',
});

db.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err);
    return;
  }
  console.log('Database connected!');
});

module.exports = db;
