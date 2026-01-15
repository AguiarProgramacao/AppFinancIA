export async function sendTwoFactorEmail(
  email: string,
  code: string,
  purpose: "login" | "enable" | "reset"
) {
  const label =
    purpose === "login"
      ? "acesso"
      : purpose === "enable"
      ? "ativacao"
      : "redefinicao de senha";
  const subject = `Codigo de ${label}`;
  const text = `Seu codigo de ${label}: ${code}`;

  if (!process.env.SMTP_HOST) {
    console.log(`[2fa:${purpose}] ${email} codigo: ${code}`);
    return;
  }

  const nodemailer = require("nodemailer");
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: email,
    subject,
    text,
  });
}

export async function sendNotificationEmail(
  email: string,
  subject: string,
  text: string
) {
  if (!process.env.SMTP_HOST) {
    console.log(`[notification] ${email} ${subject}: ${text}`);
    return;
  }

  const nodemailer = require("nodemailer");
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: email,
    subject,
    text,
  });
}
