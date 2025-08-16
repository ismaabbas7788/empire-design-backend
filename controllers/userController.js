const db = require("../config/db");

// Get all registered users with dynamic columns
const getUsers = async (req, res) => {
  try {
    const [results, fields] = await db.query("SELECT * FROM register");

    // Extract column names from the fields metadata
    const columns = fields.map((field) => field.name);
    res.status(200).json({ columns, users: results });
  } catch (err) {
    console.error("Error fetching registered users:", err);
    return res.status(500).json({ error: "Database error" });
  }
};

module.exports = {
  getUsers,
};
