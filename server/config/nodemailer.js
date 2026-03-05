const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";
const REQUEST_TIMEOUT_MS = 10000;

const normalizeRecipients = (to) => {
  if (Array.isArray(to)) {
    return to.map((email) => ({ email }));
  }
  if (typeof to === "string" && to.includes(",")) {
    return to
      .split(",")
      .map((email) => email.trim())
      .filter(Boolean)
      .map((email) => ({ email }));
  }
  return [{ email: to }];
};

const buildSender = (from) => {
  const senderEmail = process.env.SENDER_EMAIL || from;
  const senderName = process.env.SENDER_NAME;
  if (senderName) {
    return { email: senderEmail, name: senderName };
  }
  return { email: senderEmail };
};

const sendMail = async ({ from, to, subject, text, html }) => {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    throw new Error("BREVO_API_KEY is not set");
  }
  if (!from && !process.env.SENDER_EMAIL) {
    throw new Error("SENDER_EMAIL is not set");
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const payload = {
      sender: buildSender(from),
      to: normalizeRecipients(to),
      subject,
      textContent: text,
      htmlContent: html,
    };

    const response = await fetch(BREVO_API_URL, {
      method: "POST",
      headers: {
        "api-key": apiKey,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(
        `Brevo API error ${response.status}: ${body || response.statusText}`
      );
    }
    return response.json().catch(() => ({}));
  } finally {
    clearTimeout(timeout);
  }
};

const transporter = { sendMail };

export default transporter;
