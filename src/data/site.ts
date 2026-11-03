// Company details used across the site. Fill in phone and socials when available:
// anything left empty is simply not shown.
export const site = {
  name: 'Markforth Solutions',
  legalName: 'Markforth Solutions (Private) Limited',
  url: 'https://markforthsol.com',
  email: 'info@markforthsol.com',
  phone: '+92 327 6534710',
  whatsapp: '923276534710',
  address: {
    lines: ['Office No. 04–05, 1st Floor', 'Burj-e-Noor Trading Center, Main Murree Road', 'Shamsabad, Rawalpindi 43490, Pakistan'],
    short: 'Shamsabad, Rawalpindi',
    mapUrl:
      'https://www.google.com/maps/search/?api=1&query=Burj-e-Noor+Trading+Center+Main+Murree+Road+Shamsabad+Rawalpindi',
  },
  socials: [
    // { label: 'LinkedIn', href: 'https://www.linkedin.com/company/…' },
    // { label: 'Facebook', href: 'https://www.facebook.com/…' },
    // { label: 'Instagram', href: 'https://www.instagram.com/…' },
  ] as { label: string; href: string }[],
  tagline: 'Built to move business forward.',
  motto: 'People. Process. Progress.',
};

export const nav = [
  { label: 'Services', href: '/services.html' },
  { label: 'Campaigns', href: '/campaigns.html' },
  { label: 'About', href: '/about.html' },
  { label: 'Careers', href: '/careers.html' },
];

// The four steps every partnership follows (from the current site).
export const process = [
  { name: 'Discover', line: 'First, tell us what’s next.', text: 'Share your campaign, customer needs or operational priorities.' },
  { name: 'Align', line: 'Then we define the details.', text: 'Agree on the scope, qualification criteria, workflow and expectations.' },
  { name: 'Prepare', line: 'We build the workflow.', text: 'Align the team and handoffs around the agreed requirements.' },
  { name: 'Refine', line: 'And keep moving forward.', text: 'Review feedback together and adapt the process as the work develops.' },
];

export const principles = [
  { title: 'Understand the assignment.', text: 'Begin with your objectives, campaign requirements and expectations. Define what a useful outcome looks like.' },
  { title: 'Build around the work.', text: 'Align the team, workflow and handoff process with your business. Keep responsibilities clear from the start.' },
  { title: 'Keep the conversation open.', text: 'Make feedback part of the process. Review the work together and adapt as your priorities evolve.' },
];

export const faqs = [
  { q: 'What services can we discuss?', a: 'Lead generation, customer support and business process outsourcing. We begin by understanding your requirements and confirm the scope before any work starts.' },
  { q: 'Which campaigns do you focus on?', a: 'Medicare, ACA, Final Expense, Auto Insurance, Hospital Indemnity and Home Improvement. Availability and partnership terms are discussed directly with our team.' },
  { q: 'How do we start a partnership?', a: 'Use the enquiry form or email info@markforthsol.com. Include your campaign, required service, audience and preferred model so we can have a focused conversation.' },
  { q: 'Can I apply without BPO experience?', a: 'Yes. The application includes a fresher option. Tell us about your education, communication skills, availability and the role you are interested in. Applications are subject to review and do not guarantee an interview or offer.' },
  { q: 'Where is Markforth based?', a: 'Our office is in Shamsabad, Rawalpindi: Office No. 04–05, 1st Floor, Burj-e-Noor Trading Center, Main Murree Road.' },
];

// The enquiry form's service options, unchanged from the live site (the API accepts these values).
export const enquiryOptions = [
  'Lead generation partnership', 'Medicare', 'ACA', 'Final Expense', 'Auto Insurance', 'Hospital Indemnity',
  'Home Improvement', 'Customer support', 'Business outsourcing', 'Career enquiry', 'Something else',
];
