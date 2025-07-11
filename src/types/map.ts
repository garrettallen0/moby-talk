import { Timestamp } from 'firebase/firestore';

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  text: string;
  createdAt: Date | Timestamp;
}

export interface Citation {
  passage: string;
}

export interface ChapterAnnotation {
  annotation: string;
  citations: Citation[];
}

export interface ChapterMap {
  id: string;
  name: string;
  description: string;
  shortDescription: string;
  userId: string;
  userName: string;
  isPublic: boolean;
  selectedChapters: number[];
  theme: string;
  chapterAnnotations: Record<number, ChapterAnnotation>;
  createdAt: Date;
  updatedAt: Date;
  likes?: string[];
  comments?: any[];
} 