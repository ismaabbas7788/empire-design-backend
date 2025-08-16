const multer = require("multer");
const path = require("path");
const db = require("../config/db");
const fs = require("fs");

// Set up multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

// Get user by ID
const getUserById = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) return res.status(400).json({ error: "User ID is required" });

    const sql = "SELECT * FROM register WHERE id = ?";
    const [results] = await db.query(sql, [userId]);

    if (results.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = results[0];
    res.json({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      profileImage: user.profileImage || null,
    });
  } catch (err) {
    console.error("Error retrieving user data:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// Update profile image
const updateProfileImage = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    if (!userId) return res.status(400).json({ error: "User ID is required" });

    const profileImage = req.file.filename;
    const sql = "UPDATE register SET profileImage = ? WHERE id = ?";

    await db.query(sql, [profileImage, userId]);
    res.json({ message: "Profile image updated successfully", profileImage });
  } catch (err) {
    console.error("Error updating profile image:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// Update user details
const updateUserDetails = async (req, res) => {
  try {
    const { userId, firstName, lastName, email, phone } = req.body;
    if (!userId || !firstName || !lastName || !email || !phone) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const sql =
      "UPDATE register SET firstName = ?, lastName = ?, email = ?, phone = ? WHERE id = ?";
    await db.query(sql, [firstName, lastName, email, phone, userId]);
    res.json({ message: "User details updated successfully" });
  } catch (err) {
    console.error("Error updating user details:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// Change password
const changePassword = async (req, res) => {
  try {
    const { userId, oldPassword, newPassword } = req.body;
    if (!userId || !oldPassword || !newPassword) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const selectSql = "SELECT password FROM register WHERE id = ?";
    const [results] = await db.query(selectSql, [userId]);

    if (results.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const currentPassword = results[0].password;

    // TODO: Use bcrypt for hashing in production
    if (oldPassword !== currentPassword) {
      return res.status(400).json({ error: "Old password is incorrect" });
    }

    const updateSql = "UPDATE register SET password = ? WHERE id = ?";
    await db.query(updateSql, [newPassword, userId]);

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("Error updating password:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// Remove profile image
const removeProfileImage = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: "User ID is required" });

    const selectSql = "SELECT profileImage FROM register WHERE id = ?";
    const [results] = await db.query(selectSql, [userId]);

    if (results.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const filename = results[0].profileImage;
    const updateSql = "UPDATE register SET profileImage = NULL WHERE id = ?";

    const proceedToUpdate = async () => {
      await db.query(updateSql, [userId]);
      res.json({ message: "Profile image removed successfully" });
    };

    if (filename) {
      const filepath = path.join(__dirname, "..", "uploads", filename);
      fs.unlink(filepath, (unlinkErr) => {
        if (unlinkErr && unlinkErr.code !== "ENOENT") {
          console.error("Error deleting file:", unlinkErr);
        }
        proceedToUpdate();
      });
    } else {
      proceedToUpdate();
    }
  } catch (err) {
    console.error("Error removing profile image:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  upload,
  getUserById,
  updateProfileImage,
  updateUserDetails,
  changePassword,
  removeProfileImage,
};
