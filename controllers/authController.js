const db = require("../config/db");

// LOGIN
// LOGIN

exports.login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res
        .status(400)
        .json({ message: "Email, password, and role are required" });
    }

    // Query using async/await
    const [results] = await db.query(
      "SELECT * FROM register WHERE email = ? AND password = ? AND role = ?",
      [email, password, role]
    );

    if (results.length > 0) {
      const user = results[0];
      return res.status(200).json({
        message: "Login successful",
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
      });
    }

    return res
      .status(401)
      .json({ message: "Invalid email, password, or role" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Database error" });
  }
};

// REGISTER
exports.register = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password } = req.body;
    if (!firstName || !lastName || !email || !phone || !password)
      return res.status(400).json({ message: "All fields are required" });

    const query =
      "INSERT INTO register (firstName, lastName, email, phone, password) VALUES (?, ?, ?, ?, ?)";
    const [results] = await db.query(query, [
      firstName,
      lastName,
      email,
      phone,
      password,
    ]);
    return res.status(200).json({
      message: "User registered successfully",
      userId: results.insertId,
    });
  } catch (err) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// FORGOT PASSWORD
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required." });

    const [results] = await db.query("SELECT * FROM register WHERE email = ?", [
      email,
    ]);
    if (results.length === 0)
      return res.status(404).json({ message: "Email not found." });

    const confirmationCode = Math.floor(10000 + Math.random() * 90000);
    await db.query("UPDATE register SET reset_password = ? WHERE email = ?", [
      confirmationCode,
      email,
    ]);
    return res.status(200).json({ message: "Code saved.", confirmationCode }); // In real apps, don't send code
  } catch (err) {
    return res.status(500).json({ message: "Database error occurred." });
  }
};

exports.resendCode = async (req, res) => {
  try {
    const { email } = req.body;
    const confirmationCode = Math.floor(10000 + Math.random() * 90000);
    await db.query("UPDATE register SET reset_password = ? WHERE email = ?", [
      confirmationCode,
      email,
    ]);
    return res.status(200).json({ message: "New code sent." });
  } catch (err) {
    return res.status(500).json({ message: "Failed to resend code." });
  }
};

exports.verifyCode = async (req, res) => {
  try {
    const { email, confirmationCode } = req.body;
    if (!email || !confirmationCode)
      return res
        .status(400)
        .json({ message: "Email and confirmation code required." });

    const [results] = await db.query(
      "SELECT * FROM register WHERE email = ? AND reset_password = ?",
      [email, confirmationCode]
    );
    if (results.length === 0)
      return res.status(404).json({ message: "Invalid code." });
    return res.status(200).json({ message: "Code valid." });
  } catch (err) {
    return res.status(500).json({ message: "Database error." });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    if (!email || !newPassword)
      return res.status(400).json({ message: "Required fields missing." });

    const [result] = await db.query(
      "UPDATE register SET password = ? WHERE email = ?",
      [newPassword, email]
    );
    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Email not found." });
    return res.status(200).json({ message: "Password reset successful." });
  } catch (err) {
    return res.status(500).json({ message: "Reset failed." });
  }
};

// GOOGLE LOGIN
exports.googleLogin = async (req, res) => {
  try {
    const { email, firstName, lastName, profileImage } = req.body;

    if (!email || !firstName || !lastName) {
      return res
        .status(400)
        .json({ message: "Missing required Google profile information" });
    }

    // Check if user already exists
    const [results] = await db.query("SELECT * FROM register WHERE email = ?", [
      email,
    ]);

    if (results.length > 0) {
      const user = results[0];
      return res.status(200).json({
        message: "Google login successful (existing user)",
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        },
      });
    } else {
      // Insert new user if not exists
      const query =
        "INSERT INTO register (firstName, lastName, email, phone, password) VALUES (?, ?, ?, ?, ?)";
      const [result] = await db.query(query, [
        firstName,
        lastName,
        email,
        "",
        "",
      ]);

      return res.status(200).json({
        message: "Google login successful (new user created)",
        user: {
          id: result.insertId,
          email,
          firstName,
          lastName,
        },
      });
    }
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Database error during Google login" });
  }
};
