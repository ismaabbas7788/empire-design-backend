const db = require("../config/db");

// Get all registered users with dynamic columns
const getUsers = async (req, res) => {
  try {
    const [results, fields] = await db.query(
      "SELECT id, firstName, lastName, email, phone, password, profileImage, role FROM register"
    );

    // Extract column names from the fields metadata
    const columns = fields.map((field) => field.name);
    res.status(200).json({ columns, users: results });
  } catch (err) {
    console.error("Error fetching registered users:", err);
    return res.status(500).json({ error: "Database error" });
  }
};

// Add a new register record
const addUser = async (req, res) => {
  try {
    const data = req.body;

    // Force role to be 'admin' (admin panel only)
    data.role = "admin";

    const allowedFields = [
      "firstName",
      "lastName",
      "email",
      "phone",
      "password",
      "role",
    ];

    const filteredData = {};
    allowedFields.forEach((field) => {
      filteredData[field] = data[field] || null;
    });

    const columns = Object.keys(filteredData).join(", ");
    const placeholders = Object.keys(filteredData)
      .map(() => "?")
      .join(", ");
    const values = Object.values(filteredData);

    const sql = `INSERT INTO register (${columns}) VALUES (${placeholders})`;
    const [result] = await db.query(sql, values);

    res.status(201).json({ message: "Record added", insertId: result.insertId });
  } catch (err) {
    console.error("Error adding user:", err);
    return res.status(500).json({ error: "Failed to add record" });
  }
};

// Update a register record by id
const updateUser = async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body;

    const allowedFields = [
      "firstName",
      "lastName",
      "email",
      "phone",
      "password",
      "profileImage",
      "role",
    ];

    const filteredData = {};
    allowedFields.forEach((field) => {
      if (data[field] !== undefined) filteredData[field] = data[field];
    });

    if (Object.keys(filteredData).length === 0) {
      return res
        .status(400)
        .json({ error: "No valid fields provided to update" });
    }

    const setClause = Object.keys(filteredData)
      .map((field) => `${field} = ?`)
      .join(", ");
    const values = Object.values(filteredData);
    values.push(id);

    const sql = `UPDATE register SET ${setClause} WHERE id = ?`;
    const [result] = await db.query(sql, values);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Record not found" });
    }

    res.status(200).json({ message: "Record updated" });
  } catch (err) {
    console.error("Error updating user:", err);
    return res.status(500).json({ error: "Failed to update record" });
  }
};

// Delete user by id
const deleteUser = async (req, res) => {
  try {
    const id = req.params.id;
    const [result] = await db.query("DELETE FROM register WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Record not found" });
    }

    res.status(200).json({ message: "Record deleted" });
  } catch (err) {
    console.error("Error deleting user:", err);
    return res.status(500).json({ error: "Failed to delete record" });
  }
};

module.exports = {
  getUsers,
  addUser,
  updateUser,
  deleteUser,
};
