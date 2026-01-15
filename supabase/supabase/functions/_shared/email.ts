async function sendWithResend(params: {
  to: string;
  subject: string;
  text: string;
}) {
  const apiKey = Deno.env.get("RESEND_API_KEY");
  const from = Deno.env.get("SMTP_FROM") || Deno.env.get("RESEND_FROM");
  if (!apiKey || !from) return false;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      from,
      to: params.to,
      subject: params.subject,
      text: params.text,
    }),
  });

  return response.ok;
}

async function sendWithSendgrid(params: {
  to: string;
  subject: string;
  text: string;
}) {
  const apiKey = Deno.env.get("SENDGRID_API_KEY");
  const from = Deno.env.get("SMTP_FROM");
  if (!apiKey || !from) return false;

  const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: params.to }] }],
      from: { email: from },
      subject: params.subject,
      content: [{ type: "text/plain", value: params.text }],
    }),
  });

  return response.ok;
}

async function sendEmail(params: { to: string; subject: string; text: string }) {
  if (await sendWithResend(params)) return;
  if (await sendWithSendgrid(params)) return;
  console.log(`[email] ${params.to} ${params.subject}: ${params.text}`);
}

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
  await sendEmail({ to: email, subject, text });
}

export async function sendNotificationEmail(
  email: string,
  subject: string,
  text: string
) {
  await sendEmail({ to: email, subject, text });
}
