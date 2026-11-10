import teamCoaching from '../assets/photos/team-coaching.jpg';
import agentHeadset from '../assets/photos/agent-headset.jpg';
import leadership from '../assets/photos/leadership.jpg';
import planningNotes from '../assets/photos/planning-notes.jpg';
import callFloor from '../assets/photos/call-floor.jpg';
import workstation from '../assets/photos/workstation.jpg';
import brandedDesk from '../assets/photos/branded-desk.jpg';
import burjENoor from '../assets/photos/burj-e-noor.jpg';
import step4Refine from '../assets/photos/step-4-refine.jpg';

// Photographs supplied by Markforth (originals in X:\MarkForth Website\Assets).
// `focus` is the point that stays in view when a frame crops the photo (CSS object-position),
// so faces and key objects are not cut off on narrow phone screens.
export const photos = {
  'team-coaching': { src: teamCoaching, alt: 'A team lead pointing at a screen while an agent with a headset follows along', focus: '58% 32%' },
  'agent-headset': { src: agentHeadset, alt: 'An agent wearing a headset at a laptop in an office at night', focus: '52% 30%' },
  leadership: { src: leadership, alt: 'Two leaders in dark suits by a window above a city at sunset', focus: '50% 28%' },
  'planning-notes': { src: planningNotes, alt: 'Two people planning a workflow and a checklist in a notebook', focus: '48% 62%' },
  'call-floor': { src: callFloor, alt: 'Agents with headsets at their workstations on a call floor', focus: '50% 55%' },
  workstation: { src: workstation, alt: 'A ready workstation with a laptop, headset, mug and notebook', focus: '34% 62%' },
  'branded-desk': { src: brandedDesk, alt: 'A desk with a Markforth mug, a headset, a desk phone and an open notebook', focus: '42% 62%' },
  'burj-e-noor': { src: burjENoor, alt: 'Burj-e-Noor Trading Center on Main Murree Road, Shamsabad, lit up at night', focus: '50% 22%' },
  'step-4-refine': { src: step4Refine, alt: 'A laptop showing "Refine" on a desk with a Markforth mug and headset, a city skyline at sunset behind', focus: '42% 52%' },
} as const;

export type PhotoKey = keyof typeof photos;
