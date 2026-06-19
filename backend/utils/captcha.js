const RECAPTCHA_VERIFY_URL = "https://www.google.com/recaptcha/api/siteverify";

const isCaptchaConfigured = () => Boolean(process.env.RECAPTCHA_SECRET_KEY);

const verifyCaptcha = async (captchaToken) => {
  if (!isCaptchaConfigured()) {
    return { valid: true, skipped: true };
  }

  if (!captchaToken) {
    return { valid: false, message: "Please complete the captcha verification" };
  }

  try {
    const params = new URLSearchParams({
      secret: process.env.RECAPTCHA_SECRET_KEY,
      response: captchaToken,
    });

    const response = await fetch(`${RECAPTCHA_VERIFY_URL}?${params.toString()}`, {
      method: "POST",
    });

    const data = await response.json();

    if (!data.success) {
      return { valid: false, message: "Captcha verification failed. Please try again." };
    }

    return { valid: true };
  } catch (err) {
    console.error("[CAPTCHA] Verification error:", err.message);
    return { valid: false, message: "Captcha verification unavailable. Please try again." };
  }
};

module.exports = { verifyCaptcha, isCaptchaConfigured };
