const db = require('../config/db');

// LOGIN
// LOGIN
exports.login = (req, res) => {
  const { email, password, role } = req.body;

  if (!email || !password || !role) {
    return res.status(400).json({ message: 'Email, password, and role are required' });
  }

  db.query(
    'SELECT * FROM register WHERE email = ? AND password = ? AND role = ?',
    [email, password, role],
    (err, results) => {
      if (err) return res.status(500).json({ message: 'Database error' });

      if (results.length > 0) {
        const user = results[0];
        return res.status(200).json({
          message: 'Login successful',
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role
          }
        });
      }

      return res.status(401).json({ message: 'Invalid email, password, or role' });
    }
  );
};


// REGISTER
exports.register = (req, res) => {
  const { firstName, lastName, email, phone, password } = req.body;
  if (!firstName || !lastName || !email || !phone || !password)
    return res.status(400).json({ message: 'All fields are required' });

  const query = 'INSERT INTO register (firstName, lastName, email, phone, password) VALUES (?, ?, ?, ?, ?)';
  db.query(query, [firstName, lastName, email, phone, password], (err, results) => {
    if (err) return res.status(500).json({ message: 'Internal Server Error' });
    return res.status(200).json({ message: 'User registered successfully', userId: results.insertId });
  });
};

// FORGOT PASSWORD
exports.forgotPassword = (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email is required.' });

  db.query('SELECT * FROM register WHERE email = ?', [email], (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error occurred.' });
    if (results.length === 0) return res.status(404).json({ message: 'Email not found.' });

    const confirmationCode = Math.floor(10000 + Math.random() * 90000);
    db.query('UPDATE register SET reset_password = ? WHERE email = ?', [confirmationCode, email], (err) => {
      if (err) return res.status(500).json({ message: 'Failed to update confirmation code.' });
      return res.status(200).json({ message: 'Code saved.', confirmationCode }); // In real apps, don’t send code
    });
  });
};

exports.resendCode = (req, res) => {
  const { email } = req.body;
  const confirmationCode = Math.floor(10000 + Math.random() * 90000);
  db.query('UPDATE register SET reset_password = ? WHERE email = ?', [confirmationCode, email], (err, result) => {
    if (err) return res.status(500).json({ message: 'Failed to resend code.' });
    return res.status(200).json({ message: 'New code sent.' });
  });
};

exports.verifyCode = (req, res) => {
  const { email, confirmationCode } = req.body;
  if (!email || !confirmationCode) return res.status(400).json({ message: 'Email and confirmation code required.' });

  db.query('SELECT * FROM register WHERE email = ? AND reset_password = ?', [email, confirmationCode], (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error.' });
    if (results.length === 0) return res.status(404).json({ message: 'Invalid code.' });
    return res.status(200).json({ message: 'Code valid.' });
  });
};

exports.resetPassword = (req, res) => {
  const { email, newPassword } = req.body;
  if (!email || !newPassword) return res.status(400).json({ message: 'Required fields missing.' });

  db.query('UPDATE register SET password = ? WHERE email = ?', [newPassword, email], (err, result) => {
    if (err) return res.status(500).json({ message: 'Reset failed.' });
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Email not found.' });
    return res.status(200).json({ message: 'Password reset successful.' });
  });
};


// GOOGLE LOGIN
exports.googleLogin = (req, res) => {
  const { email, firstName, lastName, profileImage } = req.body;

  if (!email || !firstName || !lastName) {
    return res.status(400).json({ message: 'Missing required Google profile information' });
  }

  // Check if user already exists
  db.query('SELECT * FROM register WHERE email = ?', [email], (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error while checking user' });

    if (results.length > 0) {
      const user = results[0];
      return res.status(200).json({
        message: 'Google login successful (existing user)',
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName
        }
      });
    } else {
      // Insert new user if not exists
      const query = 'INSERT INTO register (firstName, lastName, email, phone, password) VALUES (?, ?, ?, ?, ?)';
      db.query(query, [firstName, lastName, email, '', ''], (err, result) => {
        if (err) return res.status(500).json({ message: 'Database error during Google sign-up' });

        return res.status(200).json({
          message: 'Google login successful (new user created)',
          user: {
            id: result.insertId,
            email,
            firstName,
            lastName
          }
        });
      });
    }
  });
};
