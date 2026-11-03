import type { APIRoute } from 'astro';
import { services } from '../data/services';
import { campaigns } from '../data/campaigns';

// Public pages only. /track.html, /api/ and /hr/ stay out, as in robots.txt.
export const GET: APIRoute = () => {
  const paths = [
    '/', '/services.html', ...services.map((s) => `/services/${s.slug}.html`),
    '/campaigns.html', ...campaigns.map((c) => `/campaigns/${c.slug}.html`),
    '/about.html', '/contact.html', '/careers.html', '/apply.html',
  ];
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${paths
    .map((p) => `  <url><loc>https://markforthsol.com${p}</loc></url>`)
    .join('\n')}\n</urlset>\n`;
  return new Response(body, { headers: { 'Content-Type': 'application/xml' } });
};
