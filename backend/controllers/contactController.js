const { sendContactEmail } = require("../services/emailService");

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const submitContact = async (req, res) => {
  try {
    const name = req.body.name?.trim();
    const email = req.body.email?.trim();
    const message = req.body.message?.trim();

    if (!name || name.length < 2) {
      return res.status(400).json({
        message: "Please enter a valid name",
        alert: false,
      });
    }

    if (!email || !EMAIL_REGEX.test(email)) {
      return res.status(400).json({
        message: "Please enter a valid email address",
        alert: false,
      });
    }

    if (!message || message.length < 10) {
      return res.status(400).json({
        message: "Message must be at least 10 characters",
        alert: false,
      });
    }

    const result = await sendContactEmail({ name, email, message });

    if (!result.sent) {
      return res.status(503).json({
        message: result.reason || "Failed to send message. Please try again later.",
        alert: false,
      });
    }

    res.json({
      message: "Thank you! We will get back to you soon.",
      alert: true,
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to send message. Please try again later.",
      alert: false,
    });
  }
};

module.exports = { submitContact };
