import { Item, Category, ContentType, UserProfile } from '../types';

const STORAGE_KEY_ITEMS = 'hriday_portfolio_items';
const STORAGE_KEY_PROFILE = 'hriday_portfolio_profile';

const INITIAL_PROFILE: UserProfile = {
  name: "Hriday Gupta",
  title: "BTech CSE AIML Student & Creative Director",
  university: "Sharda University",
  degree: "BTech CSE (Artificial Intelligence & Machine Learning)",
  about: "I am a 21-year-old explorer who loves to record everything. Bridging the gap between complex algorithms and visual storytelling. Passionate about AI, Video Editing, and Content Creation.",
  skills: ["Python", "TensorFlow", "React", "Video Editing", "Photography", "Adobe Premiere Pro", "Data Structures"],
  // IMPORTANT: Ensure a file named 'hriday.jpg' exists in your public folder
  avatarUrl: '/hriday.jpg'
};

const INITIAL_ITEMS: Item[] = [
  // --- ACADEMIC ---
  {
    id: '1',
    title: 'AI-Powered Traffic Analysis',
    description: 'A computer vision project using YOLOv8 to detect and classify vehicles in real-time.',
    category: Category.ACADEMIC,
    type: ContentType.PROJECT,
    mediaUrl: 'https://images.unsplash.com/photo-1555421689-d68471e18963?auto=format&fit=crop&q=80&w=800',
    tags: ['Python', 'OpenCV', 'AI/ML'],
    linkUrl: 'https://github.com'
  },
  {
    id: '2',
    title: 'Data Science Certification',
    description: 'Advanced specialization in Data Science from Coursera.',
    category: Category.ACADEMIC,
    type: ContentType.CERTIFICATION,
    mediaUrl: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&q=80&w=800',
    tags: ['Data Science', 'Statistics'],
    date: '2023'
  },
  {
    id: 'a1',
    title: 'Python Mastery',
    description: 'Proficient in Python for Data Science and Backend Development.',
    category: Category.ACADEMIC,
    type: ContentType.SKILL,
    mediaUrl: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?auto=format&fit=crop&q=80&w=800',
    tags: ['Programming'],
  },
  {
    id: 'a2',
    title: 'Dr. Alan Turing',
    description: 'Mentored me during my thesis on Computational Logic.',
    category: Category.ACADEMIC,
    type: ContentType.MENTOR,
    mediaUrl: 'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?auto=format&fit=crop&q=80&w=800',
    tags: ['Professor', 'Guide'],
  },
  {
    id: 'a3',
    title: 'Exceptional Problem Solver',
    description: '"Hriday showed great aptitude for algorithms during the hackathon."',
    category: Category.ACADEMIC,
    type: ContentType.REVIEW,
    mediaUrl: '',
    tags: ['Hackathon'],
    author: 'Jane Doe, Team Lead'
  },

  // --- CREATIVE ---
  {
    id: '3',
    title: 'Cinematic Travel Vlog',
    description: 'A compilation of my travels across the Himalayas, focusing on color grading and sound design.',
    category: Category.CREATIVE,
    type: ContentType.CINEMATOGRAPHY,
    mediaUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=800',
    tags: ['Editing', 'Cinematography', 'Premiere Pro'],
    linkUrl: '#'
  },
  {
    id: '4',
    title: 'Urban Photography Series',
    description: 'Exploring the geometry of city life through a lens.',
    category: Category.CREATIVE,
    type: ContentType.PHOTOGRAPHY,
    mediaUrl: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&q=80&w=800',
    tags: ['Photography', 'Composition'],
  },
  {
    id: 'c1',
    title: 'Neon Nights Edit',
    description: 'A high-energy music video edit with glitch effects.',
    category: Category.CREATIVE,
    type: ContentType.VIDEO_EDIT,
    mediaUrl: 'https://images.unsplash.com/photo-1535016120720-40c6874c3b1c?auto=format&fit=crop&q=80&w=800',
    tags: ['After Effects', 'VFX'],
  },
  {
    id: 'c2',
    title: 'Manali Trip 2023',
    description: 'Backpacking through the mountains.',
    category: Category.CREATIVE,
    type: ContentType.TRIP,
    mediaUrl: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&q=80&w=800',
    tags: ['Travel', 'Vlog'],
  }
];

export const getProfile = (): UserProfile => {
  const stored = localStorage.getItem(STORAGE_KEY_PROFILE);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(INITIAL_PROFILE));
    return INITIAL_PROFILE;
  }
  return JSON.parse(stored);
};

export const updateProfile = (profile: UserProfile): void => {
  localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(profile));
};

export const getItems = (): Item[] => {
  const stored = localStorage.getItem(STORAGE_KEY_ITEMS);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY_ITEMS, JSON.stringify(INITIAL_ITEMS));
    return INITIAL_ITEMS;
  }
  return JSON.parse(stored);
};

export const addItem = (item: Omit<Item, 'id'>): Item => {
  const items = getItems();
  const newItem = { ...item, id: Date.now().toString() };
  items.unshift(newItem);
  localStorage.setItem(STORAGE_KEY_ITEMS, JSON.stringify(items));
  return newItem;
};

export const deleteItem = (id: string): void => {
  const items = getItems().filter(i => i.id !== id);
  localStorage.setItem(STORAGE_KEY_ITEMS, JSON.stringify(items));
};
