import { defineConfig } from 'astro/config';

// Static output for cPanel. "file" format keeps the live URLs:
// /careers.html, /apply.html, /track.html, /services/lead-generation.html …
export default defineConfig({
  site: 'https://markforthsol.com',
  output: 'static',
  build: { format: 'file', assets: '_assets' },
  trailingSlash: 'never',
  compressHTML: true,
  devToolbar: { enabled: false },
});
