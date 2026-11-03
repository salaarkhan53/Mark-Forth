import laptopTyping from '../assets/photos/laptop-typing.jpg';
import phoneLaptop from '../assets/photos/phone-laptop.jpg';
import meetingNotes from '../assets/photos/meeting-notes.jpg';
import writingNotes from '../assets/photos/writing-notes.jpg';
import keyboard from '../assets/photos/keyboard.jpg';
import deskWindow from '../assets/photos/desk-window.jpg';
import cityWindows from '../assets/photos/city-windows.jpg';
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
  'city-windows': { src: cityWindows, alt: 'People standing at tall windows above a city', credit: 'Unsplash' },
  'burj-e-noor': { src: burjENoor, alt: 'Burj-e-Noor Trading Center on Main Murree Road, Shamsabad, lit up at night', credit: 'Markforth Solutions' },
} as const;

export type PhotoKey = keyof typeof photos;

export const photoCredits = 'Photographs from Unsplash.';
