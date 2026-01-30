export enum Category {
  ACADEMIC = 'ACADEMIC',
  CREATIVE = 'CREATIVE',
}

export enum ContentType {
  // Academic Tabs
  PROJECT = 'PROJECT',
  CERTIFICATION = 'CERTIFICATION',
  SKILL = 'SKILL',
  PROFICIENCY = 'PROFICIENCY',
  MENTOR = 'MENTOR',
  REVIEW = 'REVIEW',

  // Creative Tabs
  CINEMATOGRAPHY = 'CINEMATOGRAPHY',
  VIDEO_EDIT = 'VIDEO_EDIT',
  PHOTOGRAPHY = 'PHOTOGRAPHY',
  TRIP = 'TRIP',
}

export interface Item {
  id: string;
  title: string;
  description: string;
  category: Category;
  type: ContentType;
  mediaUrl?: string; // Image or Video URL
  linkUrl?: string; // Github or External Link
  tags?: string[];
  date?: string;
  author?: string; // For reviews
}

export interface UserProfile {
  name: string;
  title: string;
  about: string;
  university: string;
  degree: string;
  skills: string[];
  avatarUrl: string;
}
