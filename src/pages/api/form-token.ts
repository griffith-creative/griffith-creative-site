import type { APIRoute } from 'astro';
import { signToken } from '../../lib/form-token';

export const prerender = false;

// Mints the signed timestamp the contact form carries. Keeping it here rather than in the
// page body lets /contact stay static and served from the CDN.
export const GET: APIRoute = () =>
  new Response(JSON.stringify({ token: signToken(Date.now()) }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
  });
