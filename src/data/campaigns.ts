// Campaign copy: category, description and scope points are taken word for word from the live site.
// "need" lists what partners are asked to share; review before launch.
export type Campaign = {
  slug: string;
  name: string;
  category: string;
  group: 'Insurance' | 'Home services';
  description: string;
  points: string[];
  need: string[];
  // Three steps a lead takes in this campaign, drawn from its scope above.
  flow: [string, string][];
};

export const campaigns: Campaign[] = [
  {
    slug: 'medicare',
    name: 'Medicare',
    category: 'Health insurance',
    group: 'Insurance',
    description: 'Lead generation and transfer campaign support for Medicare partners, with qualification criteria and handoffs defined around your requirements.',
    points: ['Audience and campaign requirements', 'Lead qualification and transfer process', 'CPL / CPA model discussion'],
    need: ['Target audience and states', 'Qualification questions', 'Transfer hours and destination', 'Preferred CPL / CPA model'],
    flow: [['Reach', 'Your states'], ['Qualify', 'Your questions'], ['Transfer', 'Live, to your team']],
  },
  {
    slug: 'aca',
    name: 'ACA',
    category: 'Health insurance',
    group: 'Insurance',
    description: 'Campaign support for ACA partners looking to define a clear outreach, qualification and transfer workflow.',
    points: ['Audience and state requirements', 'Qualification criteria and handoff process', 'CPL / CPA model discussion'],
    need: ['States and audience', 'Qualification criteria', 'Handoff process and hours', 'Preferred CPL / CPA model'],
    flow: [['Outreach', 'State by state'], ['Qualify', 'Your criteria'], ['Handoff', 'Agreed hours']],
  },
  {
    slug: 'final-expense',
    name: 'Final Expense',
    category: 'Life insurance',
    group: 'Insurance',
    description: 'Outreach and lead qualification support for final expense campaigns, aligned with your buyer requirements.',
    points: ['Target audience and campaign scope', 'Qualification and transfer requirements', 'CPL / CPA model discussion'],
    need: ['Target audience and scope', 'Buyer requirements', 'Transfer requirements and hours', 'Preferred CPL / CPA model'],
    flow: [['Outreach', 'Your audience'], ['Qualify', 'Buyer requirements'], ['Transfer', 'Your hours']],
  },
  {
    slug: 'auto-insurance',
    name: 'Auto Insurance',
    category: 'Personal insurance',
    group: 'Insurance',
    description: 'Discuss lead generation and transfer support for auto insurance campaigns, built around your coverage areas and acceptance criteria.',
    points: ['Coverage areas and audience criteria', 'Lead information and qualification requirements', 'Transfer process and partnership model'],
    need: ['Coverage areas', 'Acceptance criteria', 'Lead information required', 'Transfer process and model'],
    flow: [['Coverage', 'Your areas only'], ['Qualify', 'Your acceptance rules'], ['Transfer', 'Lead details included']],
  },
  {
    slug: 'hospital-indemnity',
    name: 'Hospital Indemnity',
    category: 'Supplemental health insurance',
    group: 'Insurance',
    description: 'Connect with our team about hospital indemnity campaign support, from outreach requirements to the agreed handoff.',
    points: ['Campaign scope and qualification requirements', 'Lead and transfer workflow', 'Buyer acceptance criteria and partnership terms'],
    need: ['Campaign scope', 'Qualification requirements', 'Buyer acceptance criteria', 'Partnership terms'],
    flow: [['Scope', 'Agreed up front'], ['Qualify', 'Your requirements'], ['Handoff', 'Buyer accepted']],
  },
  {
    slug: 'home-improvement',
    name: 'Home Improvement',
    category: 'Home services',
    group: 'Home services',
    description: 'Explore outreach and lead generation support for home improvement businesses, based on the services and locations you cover.',
    points: ['Service categories and coverage areas', 'Homeowner enquiry qualification', 'Lead handoff and partnership terms'],
    need: ['Services you offer', 'Locations you cover', 'Homeowner qualification criteria', 'Handoff and partnership terms'],
    flow: [['Services', 'What you offer'], ['Homeowner', 'Enquiry qualified'], ['Handoff', 'In your locations']],
  },
];
