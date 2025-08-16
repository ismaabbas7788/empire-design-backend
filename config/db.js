const mysql = require('mysql2'); // ✅ must be mysql2

// const db = mysql.createConnection({
//   host: 'localhost',
//   user: 'root',
//   password: '',
//   database: 'ardb',
// });

const db = mysql.createPool({
  host: 'hopper.proxy.rlwy.net',     // from MYSQLHOST
  user: 'root',                      // from MYSQLUSER
  password: 'WsruyvhZDGOVoTSfuIiPkcokiySJNqnV', // from MYSQLPASSWORD
  database: 'railway',               // from MYSQL_DATABASE
  port: 31654,                        // from MYSQLPORT
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

db.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err);
    return;
  }
  console.log('Database connected!');
});

module.exports = db;
