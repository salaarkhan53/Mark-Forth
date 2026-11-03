import laptopTyping from '../assets/photos/laptop-typing.jpg';
import phoneLaptop from '../assets/photos/phone-laptop.jpg';
import meetingNotes from '../assets/photos/meeting-notes.jpg';
import writingNotes from '../assets/photos/writing-notes.jpg';
import keyboard from '../assets/photos/keyboard.jpg';
import deskWindow from '../assets/photos/desk-window.jpg';
import suitWalk from '../assets/photos/suit-walk.jpg';
import cityWindows from '../assets/photos/city-windows.jpg';
import glassRoof from '../assets/photos/glass-roof.jpg';
import towersUp from '../assets/photos/towers-up.jpg';
import clock from '../assets/photos/clock.jpg';
import concourse from '../assets/photos/concourse.jpg';
import skyline from '../assets/photos/skyline.jpg';
import officeWindows from '../assets/photos/office-windows.jpg';
import telephone from '../assets/photos/telephone-1907.jpg';
import burjENoor from '../assets/photos/burj-e-noor.jpg';

// Stock photographs (Unsplash licence, via picsum.photos) used as atmosphere.
// None shows Markforth's own office or team; replace with real photography when available.
export const photos = {
  'laptop-typing': { src: laptopTyping, alt: 'A person typing on a laptop at a wooden desk', credit: 'Unsplash' },
  'phone-laptop': { src: phoneLaptop, alt: 'A person holding a phone beside an open laptop', credit: 'Unsplash' },
  'meeting-notes': { src: meetingNotes, alt: 'Two people taking notes across a table with a tablet and coffee', credit: 'Unsplash' },
  'writing-notes': { src: writingNotes, alt: 'A hand writing notes in a notebook beside a laptop', credit: 'Unsplash' },
  keyboard: { src: keyboard, alt: 'A hand on a mouse beside a keyboard and a coffee mug', credit: 'Unsplash' },
  'desk-window': { src: deskWindow, alt: 'A tidy desk with a laptop beside an office window', credit: 'Unsplash' },
  'suit-walk': { src: suitWalk, alt: 'A man in a dark suit walking across a city street', credit: 'Alejandro Escamilla / Unsplash' },
  'city-windows': { src: cityWindows, alt: 'People standing at tall windows above a city', credit: 'Unsplash' },
  'glass-roof': { src: glassRoof, alt: 'A curved glass and steel lattice roof', credit: 'Mika Ruusunen / Unsplash' },
  'towers-up': { src: towersUp, alt: 'Glass office towers seen from below', credit: 'Matthew Wiebe / Unsplash' },
  clock: { src: clock, alt: 'Close view of a clock face', credit: 'Unsplash' },
  concourse: { src: concourse, alt: 'A busy station concourse in New York', credit: 'Nicolai Berntsen / Unsplash' },
  skyline: { src: skyline, alt: 'The New York skyline from above', credit: 'Unsplash' },
  'office-windows': { src: officeWindows, alt: 'Lit office windows on a tower at night', credit: 'Vladimir Kudinov / Unsplash' },
  'burj-e-noor': { src: burjENoor, alt: 'Burj-e-Noor Trading Center on Main Murree Road, Shamsabad, lit up at night', credit: 'Markforth Solutions' },
  'telephone-1907': {
    src: telephone,
    alt: 'Telephone Conversation, a 1907 lithograph by Moriz Jung showing two men speaking on the telephone',
    credit: 'Telephone Conversation, Moriz Jung, 1907, The Metropolitan Museum of Art (CC0)',
  },
} as const;

export type PhotoKey = keyof typeof photos;

export const photoCredits =
  'Photographs from Unsplash. Telephone Conversation by Moriz Jung, 1907, The Metropolitan Museum of Art, public domain.';
