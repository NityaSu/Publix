const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RATE_WINDOW_MS = 15 * 60 * 1000;
const RATE_MAX = 3;
const hitsByIp = new Map<string, number[]>();

type ContactBody = {
  name?: unknown;
  phone?: unknown;
  email?: unknown;
  message?: unknown;
  website?: unknown;
};

function asString(value: unknown, max: number) {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, max);
}

function isRateLimited(ip: string) {
  const now = Date.now();
  const recent = (hitsByIp.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  if (recent.length >= RATE_MAX) {
    hitsByIp.set(ip, recent);
    return true;
  }
  recent.push(now);
  hitsByIp.set(ip, recent);
  return false;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  const body = await readBody<ContactBody>(event).catch(() => ({} as ContactBody));

  // Honeypot: bots fill hidden fields; pretend success so they move on.
  if (asString(body.website, 200)) {
    return { ok: true };
  }

  const ip = getRequestIP(event, { xForwardedFor: true }) || 'unknown';
  if (isRateLimited(ip)) {
    throw createError({
      statusCode: 429,
      message: 'Too many messages. Please wait a bit, or email me directly.',
    });
  }

  const name = asString(body.name, 100);
  const phone = asString(body.phone, 40);
  const email = asString(body.email, 200);
  const message = asString(body.message, 4000);

  if (name.length < 2) {
    throw createError({ statusCode: 400, message: 'Please enter your name.' });
  }
  if (!EMAIL_RE.test(email)) {
    throw createError({ statusCode: 400, message: 'Please enter a valid email.' });
  }
  if (message.length < 10) {
    throw createError({ statusCode: 400, message: 'Please write a slightly longer message.' });
  }

  const apiKey = String(config.resendApiKey || '');
  const toEmail = String(config.contactToEmail || '');
  const fromEmail = String(config.resendFromEmail || '');

  if (!apiKey || !toEmail || !fromEmail) {
    throw createError({
      statusCode: 503,
      message: 'The contact form is not configured yet. Please email me directly.',
    });
  }

  const text = [
    `Name: ${name}`,
    `Email: ${email}`,
    phone ? `Phone: ${phone}` : null,
    '',
    message,
  ]
    .filter((line) => line !== null)
    .join('\n');

  const html = `
    <p><strong>Name:</strong> ${escapeHtml(name)}</p>
    <p><strong>Email:</strong> ${escapeHtml(email)}</p>
    ${phone ? `<p><strong>Phone:</strong> ${escapeHtml(phone)}</p>` : ''}
    <p style="white-space:pre-wrap">${escapeHtml(message)}</p>
  `;

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: fromEmail,
      to: [toEmail],
      reply_to: email,
      subject: `Portfolio contact from ${name}`,
      text,
      html,
    }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    console.error('[contact] Resend error', response.status, detail.slice(0, 500));
    throw createError({
      statusCode: 502,
      message: 'Could not send the message. Please email me directly.',
    });
  }

  return { ok: true };
});
