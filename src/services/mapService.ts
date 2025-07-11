import { 
  collection, 
  doc, 
  getDocs,
  getDoc,
  query, 
  where, 
  addDoc, 
  deleteDoc, 
  updateDoc, 
  arrayUnion, 
  arrayRemove, 
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase';
import { ChapterMap, ChapterAnnotation } from '../types/map';

// Utility function to clean chapter annotations by removing empty citations
const cleanChapterAnnotations = (annotations: Record<number, ChapterAnnotation>): Record<number, ChapterAnnotation> => {
  const cleaned: Record<number, ChapterAnnotation> = {};
  
  Object.entries(annotations).forEach(([chapter, annotation]) => {
    const filteredCitations = annotation.citations?.filter(citation => 
      citation.passage && citation.passage.trim() !== ''
    ) || [];
    
    cleaned[Number(chapter)] = {
      ...annotation,
      citations: filteredCitations
    };
  });
  
  return cleaned;
};

const MAPS_COLLECTION = 'maps';

export const saveMap = async (
  userId: string,
  userName: string,
  name: string,
  selectedChapters: number[],
  description: string = '',
  shortDescription: string = '',
  isPublic: boolean = false,
  chapterAnnotations: Record<number, ChapterAnnotation> = {},
  theme: string = ''
): Promise<string> => {
  try {
    const mapData: Omit<ChapterMap, 'id'> = {
      name,
      description,
      shortDescription,
      userId,
      userName,
      selectedChapters,
      isPublic,
      likes: [],
      chapterAnnotations: cleanChapterAnnotations(chapterAnnotations),
      theme,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const docRef = await addDoc(collection(db, MAPS_COLLECTION), mapData);
    return docRef.id;
  } catch (error) {
    console.error('Error saving map:', error);
    throw error;
  }
};

export const updateMap = async (
  mapId: string,
  data: Partial<ChapterMap>
): Promise<void> => {
  try {
    const mapRef = doc(db, MAPS_COLLECTION, mapId);
    const updateData = { ...data };
    delete updateData.id;
    delete updateData.createdAt;
    delete updateData.updatedAt;
    
    // Clean chapter annotations if they exist in the update data
    if (updateData.chapterAnnotations) {
      updateData.chapterAnnotations = cleanChapterAnnotations(updateData.chapterAnnotations);
    }
    
    await updateDoc(mapRef, {
      ...updateData,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating map:', error);
    throw error;
  }
};

export const deleteMap = async (mapId: string): Promise<void> => {
  try {
    const mapRef = doc(db, MAPS_COLLECTION, mapId);
    await deleteDoc(mapRef);
  } catch (error) {
    console.error('Error deleting map:', error);
    throw error;
  }
};

export const updateChapterAnnotations = async (
  mapId: string,
  chapter: number,
  annotation: ChapterAnnotation
): Promise<void> => {
  try {
    const mapRef = doc(db, MAPS_COLLECTION, mapId);
    const mapDoc = await getDoc(mapRef);
    
    if (!mapDoc.exists()) {
      throw new Error('Map not found');
    }

    const mapData = mapDoc.data() as ChapterMap;
    const currentAnnotations = mapData.chapterAnnotations || {};
    
    // If annotation is empty, remove the chapter entry
    if (!annotation.annotation && (!annotation.citations || annotation.citations.length === 0)) {
      const rest = { ...currentAnnotations };
      delete rest[chapter];
      await updateDoc(mapRef, {
        chapterAnnotations: rest,
        updatedAt: serverTimestamp()
      });
    } else {
      // Update or add the chapter's annotation
      await updateDoc(mapRef, {
        [`chapterAnnotations.${chapter}`]: annotation,
        updatedAt: serverTimestamp()
      });
    }
  } catch (error) {
    console.error('Error updating chapter annotations:', error);
    throw error;
  }
};

export const getPublicMaps = async (): Promise<ChapterMap[]> => {
  try {
    const q = query(
      collection(db, MAPS_COLLECTION),
      where('isPublic', '==', true)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date()
      } as ChapterMap;
    });
  } catch (error) {
    console.error('Error getting public maps:', error);
    throw error;
  }
};

export const getUserMaps = async (userId: string): Promise<ChapterMap[]> => {
  try {
    const q = query(
      collection(db, MAPS_COLLECTION),
      where('userId', '==', userId)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date()
      } as ChapterMap;
    });
  } catch (error) {
    console.error('Error getting user maps:', error);
    throw error;
  }
};

export const toggleLike = async (mapId: string, userId: string): Promise<void> => {
  try {
    const mapRef = doc(db, MAPS_COLLECTION, mapId);
    const mapDoc = await getDoc(mapRef);
    const mapData = mapDoc.data();

    if (!mapData) {
      throw new Error('Map not found');
    }

    const likes = mapData.likes || [];
    const hasLiked = likes.includes(userId);

    await updateDoc(mapRef, {
      likes: hasLiked ? arrayRemove(userId) : arrayUnion(userId)
    });
  } catch (error) {
    console.error('Error toggling like:', error);
    throw error;
  }
};

export const addComment = async (mapId: string, userId: string, userName: string, text: string): Promise<void> => {
  try {
    const comment = {
      id: crypto.randomUUID(),
      userId,
      userName,
      text,
      createdAt: serverTimestamp()
    };

    const mapRef = doc(db, 'maps', mapId);
    await updateDoc(mapRef, {
      comments: arrayUnion(comment)
    });
  } catch (error) {
    console.error('Error adding comment:', error);
    throw error;
  }
};

export const getMapById = async (mapId: string): Promise<ChapterMap | null> => {
  try {
    const docRef = doc(db, MAPS_COLLECTION, mapId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date()
      } as ChapterMap;
    }
    return null;
  } catch (error) {
    console.error('Error getting map by id:', error);
    throw error;
  }
}; 