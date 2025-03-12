export interface ChapterRelationship {
  sourceChapter: number;
  relatedChapters: number[];
}

export interface Configuration {
  id: string;
  userId: string;
  name: string;
  description?: string;
  relationships: ChapterRelationship[];
  createdAt: Date;
  updatedAt: Date;
} 