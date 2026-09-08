const nodemailer = require("nodemailer");
const {getGroup} = require("./appSettings.service");

function getTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD}
  });
}

async function sendEmail({to, subject, text, html}) {
  const settings = await getGroup("email");

  if (!settings.enabled) {
    return {skipped: true, reason: "Email disabled"};
  }

  if (!to) {
    return {skipped: true, reason: "Email address missing"};
  }

  const transporter = getTransporter();

  return transporter.sendMail({
    from: {
      name: settings.fromName || "Driver Center",
      address: settings.fromEmail || process.env.SMTP_USER
    },
    to,
    subject,
    text,
    html
  });
}

module.exports = {sendEmail};