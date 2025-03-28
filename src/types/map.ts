import { Timestamp } from 'firebase/firestore';

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  text: string;
  createdAt: Date | Timestamp;
}

export interface ChapterMap {
  id: string;
  name: string;
  description?: string;
  userId: string;
  selectedChapters: number[];
  isPublic: boolean;
  likes?: string[];
  comments?: Comment[];
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
} 