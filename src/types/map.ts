import { Timestamp } from 'firebase/firestore';

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  text: string;
  createdAt: Date | Timestamp;
}

export interface Annotation {
  passage: string;
  commentary: string;
}

export interface ChapterMap {
  id: string;
  name: string;
  description?: string;
  userId: string;
  userName: string;
  selectedChapters: number[];
  isPublic: boolean;
  theme: string;
  likes?: string[];
  comments?: Comment[];
  chapterAnnotations?: { [key: number]: Annotation[] };
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
} 