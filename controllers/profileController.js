const multer = require('multer');
const path = require('path');
const db = require('../config/db');
const fs = require('fs');

// Set up multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Get user by ID
const getUserById = (req, res) => {
  const { userId } = req.body;

  if (!userId) return res.status(400).json({ error: 'User ID is required' });

  const sql = 'SELECT * FROM register WHERE id = ?';
  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error('Error retrieving user data:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'User not found' });
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
  });
};

// Update profile image
const updateProfileImage = (req, res) => {
  const { userId } = req.body;
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  if (!userId) return res.status(400).json({ error: 'User ID is required' });

  const profileImage = req.file.filename;
  const sql = 'UPDATE register SET profileImage = ? WHERE id = ?';

  db.query(sql, [profileImage, userId], (err) => {
    if (err) {
      console.error('Error updating profile image:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    res.json({ message: 'Profile image updated successfully', profileImage });
  });
};

// Update user details
const updateUserDetails = (req, res) => {
  const { userId, firstName, lastName, email, phone } = req.body;
  if (!userId || !firstName || !lastName || !email || !phone) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const sql = 'UPDATE register SET firstName = ?, lastName = ?, email = ?, phone = ? WHERE id = ?';
  db.query(sql, [firstName, lastName, email, phone, userId], (err) => {
    if (err) {
      console.error('Error updating user details:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    res.json({ message: 'User details updated successfully' });
  });
};

// Change password
const changePassword = (req, res) => {
  const { userId, oldPassword, newPassword } = req.body;
  if (!userId || !oldPassword || !newPassword) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const selectSql = 'SELECT password FROM register WHERE id = ?';
  db.query(selectSql, [userId], (err, results) => {
    if (err) {
      console.error('Error fetching password:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const currentPassword = results[0].password;

    // TODO: Use bcrypt for hashing in production
    if (oldPassword !== currentPassword) {
      return res.status(400).json({ error: 'Old password is incorrect' });
    }

    const updateSql = 'UPDATE register SET password = ? WHERE id = ?';
    db.query(updateSql, [newPassword, userId], (err) => {
      if (err) {
        console.error('Error updating password:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }

      res.json({ message: 'Password updated successfully' });
    });
  });
};

// Remove profile image
const removeProfileImage = (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ error: 'User ID is required' });

  const selectSql = 'SELECT profileImage FROM register WHERE id = ?';
  db.query(selectSql, [userId], (err, results) => {
    if (err) {
      console.error('Error fetching profile image:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const filename = results[0].profileImage;
    const updateSql = 'UPDATE register SET profileImage = NULL WHERE id = ?';

    const proceedToUpdate = () => {
      db.query(updateSql, [userId], (updateErr) => {
        if (updateErr) {
          console.error('Error removing image reference from DB:', updateErr);
          return res.status(500).json({ error: 'Internal Server Error' });
        }
        res.json({ message: 'Profile image removed successfully' });
      });
    };

    if (filename) {
      const filepath = path.join(__dirname, '..', 'uploads', filename);
      fs.unlink(filepath, (unlinkErr) => {
        if (unlinkErr && unlinkErr.code !== 'ENOENT') {
          console.error('Error deleting file:', unlinkErr);
        }
        proceedToUpdate();
      });
    } else {
      proceedToUpdate();
    }
  });
};

module.exports = {
  upload,
  getUserById,
  updateProfileImage,
  updateUserDetails,
  changePassword,
  removeProfileImage
};
