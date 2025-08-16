const db = require("../config/db");
const nodemailer = require("nodemailer");

// Submit contact form
const submitContactForm = async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: "All fields are required." });
    }

    const query =
      "INSERT INTO contact_messages (name, email, message) VALUES (?, ?, ?)";
    await db.query(query, [name, email, message]);

    res.status(200).json({ message: "Message submitted successfully." });
  } catch (err) {
    console.error("Error saving message:", err);
    return res
      .status(500)
      .json({ error: "Failed to submit message. Try again later." });
  }
};

// Get all contact messages
const getAllMessages = async (req, res) => {
  try {
    const [results] = await db.query(
      "SELECT * FROM contact_messages ORDER BY created_at DESC"
    );
    res.json(results);
  } catch (err) {
    console.error("Error fetching messages:", err);
    return res.status(500).json({ error: "Error fetching messages" });
  }
};

// Send reply to user
const sendReplyToUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { response } = req.body;

    if (!response) {
      return res.status(400).json({ error: "Response cannot be empty." });
    }

    const [results] = await db.query(
      "SELECT * FROM contact_messages WHERE id = ?",
      [id]
    );

    if (results.length === 0) {
      return res.status(404).json({ error: "Message not found" });
    }

    const { email, name } = results[0];

    await db.query("UPDATE contact_messages SET response = ? WHERE id = ?", [
      response,
      id,
    ]);

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "ismaabbas7788@gmail.com", // your Gmail
        pass: "nnll vuar argl tnxj", // Gmail App Password
      },
    });

    const mailOptions = {
      from: '"Empire Design" <ismaabbas7788@gmail.com>',
      to: email,
      subject: "Response from Empire Design Support",
      html: `<p>Dear ${name},</p>
             <p>${response}</p>
             <p><b>Empire Design Team</b></p>`,
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Reply sent and emailed successfully!" });
  } catch (err) {
    console.error("Error processing reply:", err);
    return res.status(500).json({ error: "Failed to process reply" });
  }
};

// ✅ Export all functions properly
module.exports = {
  submitContactForm,
  getAllMessages,
  sendReplyToUser,
};
