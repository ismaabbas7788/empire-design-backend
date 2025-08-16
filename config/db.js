const mysql = require('mysql2'); // ✅ must be mysql2

// const db = mysql.createConnection({
//   host: 'localhost',
//   user: 'root',
//   password: '',
//   database: 'ardb',
// });

const db = mysql.createConnection({
  host: 'mysql.railway.internal',     // from MYSQLHOST
  user: 'root',                      // from MYSQLUSER
  password: 'WsruyvhZDGOVoTSfuIiPkcokiySJNqnV', // from MYSQLPASSWORD
  database: 'railway',               // from MYSQL_DATABASE
  port: 3306                        // from MYSQLPORT
});

db.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err);
    return;
  }
  console.log('Database connected!');
});

module.exports = db;
