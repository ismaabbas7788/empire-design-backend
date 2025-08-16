const mysql = require('mysql2');

// ✅ Use connection pool instead of single connection
const pool = mysql.createPool({
  host: 'mysql.railway.internal',      // from MYSQLHOST
  user: 'root',                        // from MYSQLUSER
  password: 'WsruyvhZDGOVoTSfuIiPkcokiySJNqnV', // from MYSQLPASSWORD
  database: 'railway',                 // from MYSQL_DATABASE
  port: 3306,                          // from MYSQLPORT
  waitForConnections: true,
  connectionLimit: 10,  // you can adjust based on app load
  queueLimit: 0
});

// ✅ Export promise-based pool for async/await
const db = pool.promise();

module.exports = db;
