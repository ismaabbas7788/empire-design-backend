const mysql = require('mysql2');

// ✅ Use connection pool instead of single connection
const pool = mysql.createPool({
  host: 'hopper.proxy.rlwy.net',  // Railway host
  user: 'root',                   // Railway user
  password: 'WsruyvhZDGOVoTSfuIiPkcokiySJNqnV', // Railway password
  database: 'railway',            // Railway database
  port: 31654,                    // Railway port
  waitForConnections: true,
  connectionLimit: 10,   // adjust as needed
  queueLimit: 0
});

// ✅ Export promise-based pool for async/await usage
const db = pool.promise();

module.exports = db;
