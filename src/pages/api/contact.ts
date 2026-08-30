import type { APIRoute } from 'astro';
import { Resend } from 'resend';
import { tokenOk } from '../../lib/form-token';

export const prerender = false;

// Abuse controls without a shared store: the signed timestamp from /api/form-token plus a
// per-instance IP throttle. Upgrade path is Turnstile.
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const hits = new Map<string, number[]>();

const throttled = (ip: string) => {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > MAX_PER_WINDOW;
};

const TO_ADDRESS = process.env.CONTACT_TO_ADDRESS ?? 'hello@griffithcreative.co';
// Defaults to Resend's shared onboarding sender, which works without domain verification.
// Once griffithcreative.co is verified in Resend, set CONTACT_FROM_ADDRESS to e.g. 'Griffith Creative <hello@griffithcreative.co>'.
const FROM_ADDRESS =
  process.env.CONTACT_FROM_ADDRESS ?? 'Griffith Creative <onboarding@resend.dev>';

const SERVICES = new Set(['design-build', 'enterprise', 'systems', 'care', 'not-sure']);
const BUDGETS = new Set(['under-10k', '10-25k', '25-75k', '75k-plus', 'not-sure']);

const escape = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));

export const POST: APIRoute = async ({ request, redirect }) => {
  let data: FormData;
  try {
    data = await request.formData();
  } catch {
    return new Response('Bad request', { status: 400 });
  }

  const honeypot = (data.get('company-website') ?? '').toString().trim();
  if (honeypot) {
    return redirect('/contact/thanks/', 303);
  }

  const token = (data.get('t') ?? '').toString();
  if (!tokenOk(token)) {
    return redirect('/contact/?error=1', 303);
  }

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown';
  if (throttled(ip)) {
    return new Response('Too many requests', { status: 429 });
  }

  const name = (data.get('name') ?? '').toString().trim();
  const email = (data.get('email') ?? '').toString().trim();
  const business = (data.get('business') ?? '').toString().trim();
  const service = (data.get('service') ?? '').toString().trim();
  const phone = (data.get('phone') ?? '').toString().trim();
  const budget = (data.get('budget') ?? '').toString().trim();
  const message = (data.get('message') ?? '').toString().trim();

  if (!name || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return redirect('/contact/?error=1', 303);
  }

  // The two qualifying selects are required in the markup; enforce it here too.
  if (!SERVICES.has(service) || !BUDGETS.has(budget)) {
    return redirect('/contact/?error=1', 303);
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error('RESEND_API_KEY is not configured');
    return redirect('/contact/?error=1', 303);
  }

  const resend = new Resend(apiKey);

  const subject = `New inquiry: ${name}${business ? ` (${business})` : ''}`;
  const text = [
    `Name: ${name}`,
    `Email: ${email}`,
    business && `Business: ${business}`,
    service && `Service: ${service}`,
    phone && `Phone: ${phone}`,
    budget && `Budget: ${budget}`,
    '',
    'Message:',
    message || '(none)',
  ]
    .filter(Boolean)
    .join('\n');

  const html = `
    <h2>New inquiry from griffithcreative.co</h2>
    <p><strong>Name:</strong> ${escape(name)}</p>
    <p><strong>Email:</strong> <a href="mailto:${escape(email)}">${escape(email)}</a></p>
    ${business ? `<p><strong>Business:</strong> ${escape(business)}</p>` : ''}
    ${service ? `<p><strong>Service:</strong> ${escape(service)}</p>` : ''}
    ${phone ? `<p><strong>Phone:</strong> ${escape(phone)}</p>` : ''}
    ${budget ? `<p><strong>Budget:</strong> ${escape(budget)}</p>` : ''}
    <p><strong>Message:</strong></p>
    <p style="white-space:pre-wrap">${escape(message || '(none)')}</p>
  `;

  try {
    const result = await resend.emails.send({
      from: FROM_ADDRESS,
      to: TO_ADDRESS,
      replyTo: email,
      subject,
      text,
      html,
    });
    if (result.error) {
      console.error('Resend error', result.error);
      return redirect('/contact/?error=1', 303);
    }
  } catch (err) {
    console.error('Contact form failed', err);
    return redirect('/contact/?error=1', 303);
  }

  // Confirmation to the person who wrote in. Failure here must not fail the inquiry.
  try {
    const firstName = name.split(/\s+/)[0];
    await resend.emails.send({
      from: FROM_ADDRESS,
      to: email,
      replyTo: TO_ADDRESS,
      subject: 'Got your message',
      text: [
        `Hi ${firstName},`,
        '',
        'Thanks for getting in touch with Griffith Creative. We have your message and will reply within one business day, usually sooner.',
        '',
        'If you want to talk before then, book a time here: https://cal.com/griffithcreative/disco',
        'Or call +1 (310) 818-3092.',
        '',
        'Replying to this email reaches us directly.',
        '',
        'Griffith Creative',
        'Los Angeles',
      ].join('\n'),
    });
  } catch (err) {
    console.error('Confirmation email failed', err);
  }

  return redirect('/contact/thanks/', 303);
};

export const GET: APIRoute = () => new Response('Method Not Allowed', { status: 405 });
