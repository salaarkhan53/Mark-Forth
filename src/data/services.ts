import type { PhotoKey } from './photos';
// Service copy. Summary, body and tags come from the live site; the scope lists expand
// on them without adding claims. Review before launch.
export type Service = {
  slug: string;
  name: string;
  verb: string; // one word the service does
  summary: string;
  body: string;
  enquiry: string; // value of the enquiry form's service select
  scope: { item: string; detail: string; value: string }[];
  agree: string[];
  campaigns: boolean; // links to the campaign pages
  photo: PhotoKey;
};

export const services: Service[] = [
  {
    slug: 'lead-generation',
    name: 'Lead Generation',
    verb: 'Connect',
    summary: 'Start meaningful conversations with potential customers.',
    body: 'We support your acquisition process with outreach and lead qualification aligned to your campaign requirements, then hand each qualified conversation over the way you agreed.',
    enquiry: 'Lead generation partnership',
    scope: [
      { item: 'Customer outreach', detail: 'Conversations opened with the audience your campaign defines.', value: 'Your audience' },
      { item: 'Lead qualification', detail: 'Every lead checked against the criteria agreed before launch.', value: 'Your criteria' },
      { item: 'Transfer and handoff', detail: 'Qualified conversations passed on in the format and hours you set.', value: 'Your process' },
      { item: 'Commercial model', detail: 'Cost per lead or per acquisition, discussed during onboarding.', value: 'CPL / CPA' },
    ],
    agree: ['Audience and campaign requirements', 'Lead qualification and transfer process', 'Hours, volumes and reporting', 'CPL / CPA model discussion'],
    campaigns: true,
    photo: 'agent-headset',
  },
  {
    slug: 'customer-support',
    name: 'Customer Support',
    verb: 'Support',
    summary: 'Give every conversation the attention it deserves.',
    body: 'Build a support workflow around your customers, your processes and the experience you want to deliver, with a team that follows your standards from the first reply.',
    enquiry: 'Customer support',
    scope: [
      { item: 'Customer care', detail: 'Enquiries handled in your voice, against your guidelines.', value: 'Your standards' },
      { item: 'Service workflows', detail: 'The steps, escalations and records your team relies on.', value: 'Your workflow' },
      { item: 'Coverage', detail: 'Support hours planned around when your customers call.', value: 'Your hours' },
      { item: 'Review', detail: 'Feedback shared regularly so the service keeps improving.', value: 'Ongoing' },
    ],
    agree: ['Channels, hours and expected volumes', 'Your guidelines, tone and escalation paths', 'What a resolved conversation looks like', 'How feedback and reporting are shared'],
    campaigns: false,
    photo: 'team-coaching',
  },
  {
    slug: 'business-outsourcing',
    name: 'Business Outsourcing',
    verb: 'Operate',
    summary: 'Make room for the work that moves you ahead.',
    body: 'Bring defined operational tasks to a dedicated team with clear handoffs, communication and accountability, so your own people can focus on what only they can do.',
    enquiry: 'Business outsourcing',
    scope: [
      { item: 'Dedicated teams', detail: 'People assigned to your work, trained on your process.', value: 'Dedicated' },
      { item: 'Process support', detail: 'Defined operational tasks taken on with clear ownership.', value: 'Defined scope' },
      { item: 'Clear handoffs', detail: 'Agreed inputs, outputs and turnaround for every task.', value: 'Agreed' },
      { item: 'Communication', detail: 'One line of contact and regular check-ins on the work.', value: 'Regular' },
    ],
    agree: ['Which tasks move and which stay with you', 'Inputs, outputs and turnaround', 'Access, tools and data handling', 'Check-ins and accountability'],
    campaigns: false,
    photo: 'call-floor',
  },
];
