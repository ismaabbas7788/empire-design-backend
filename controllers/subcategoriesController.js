const db = require("../config/db");

// ✅ GET all subcategories with their category names
const getAllSubcategories = async (req, res) => {
  try {
    const query = `
      SELECT subcategories.id, subcategories.name AS subcategory_name, categories.name AS category_name
      FROM subcategories
      JOIN categories ON subcategories.category_id = categories.id
    `;

    const [results] = await db.query(query); // ✅ using async/await
    res.status(200).json(results);
  } catch (err) {
    console.error("Error fetching subcategories:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// ✅ ADD a new subcategory
const addSubcategory = async (req, res) => {
  try {
    const { name, category_id } = req.body;

    if (!name || !category_id) {
      return res
        .status(400)
        .json({ error: "Name and category_id are required." });
    }

    const query = "INSERT INTO subcategories (name, category_id) VALUES (?, ?)";
    await db.query(query, [name, category_id]);

    res.status(201).json({ message: "Subcategory added successfully." });
  } catch (err) {
    console.error("Error inserting subcategory:", err);
    return res.status(500).json({ error: "Database insert failed." });
  }
};

// ✅ UPDATE a subcategory
const updateSubcategory = async (req, res) => {
  try {
    const subcategoryId = req.params.id;
    const { name, category_id } = req.body;

    if (!name || !category_id) {
      return res
        .status(400)
        .json({ error: "Name and category_id are required." });
    }

    const query =
      "UPDATE subcategories SET name = ?, category_id = ? WHERE id = ?";
    await db.query(query, [name, category_id, subcategoryId]);

    res.status(200).json({ message: "Subcategory updated successfully." });
  } catch (err) {
    console.error("Error updating subcategory:", err);
    return res.status(500).json({ error: "Database update failed." });
  }
};

// ✅ DELETE a subcategory
const deleteSubcategory = async (req, res) => {
  try {
    const subcategoryId = req.params.id;

    const query = "DELETE FROM subcategories WHERE id = ?";
    await db.query(query, [subcategoryId]);

    res.status(200).json({ message: "Subcategory deleted successfully." });
  } catch (err) {
    console.error("Error deleting subcategory:", err);
    return res.status(500).json({ error: "Database delete failed." });
  }
};

module.exports = {
  getAllSubcategories,
  addSubcategory,
  updateSubcategory,
  deleteSubcategory,
};
