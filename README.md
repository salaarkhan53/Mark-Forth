# Markforth Solutions website

The new multi-page website for **Markforth Solutions (Private) Limited**, a BPO and lead generation company in Rawalpindi, Pakistan.

**Live preview:** https://salaarkhan53.github.io/Mark-Forth/

> The preview shows the full design, pages and animations. The enquiry form, job applications, tracking and interview booking need the company's PHP server, so they do not submit in the preview. The job list shows a saved copy of the current openings.

## Pages

Home, Services (plus Lead Generation, Customer Support and Business Outsourcing), Campaigns (plus six campaign pages), About, Careers, Apply, Track, Contact and a 404 page.

## Built with

- [Astro](https://astro.build) (static output)
- [GSAP](https://gsap.com) and [Lenis](https://lenis.darkroom.engineering) for motion
- [Three.js](https://threejs.org) for the 3D emblem on the home page
- Self-hosted Cabinet Grotesk and General Sans fonts

## Run it locally

```bash
npm install
npm run dev      # development server
npm run build    # production files in dist/
```

## Notes

- Every page carries a strict content security policy; recommended server headers are documented separately for the hosting.
- The backend (forms API, HR panel) is not part of this repository.
