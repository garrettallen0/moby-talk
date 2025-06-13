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
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase';
import { ChapterMap, Annotation } from '../types/map';

const MAPS_COLLECTION = 'maps';

export const saveMap = async (
  userId: string,
  userName: string,
  name: string,
  selectedChapters: number[],
  description?: string,
  isPublic: boolean = false,
  chapterAnnotations?: { [key: number]: Annotation[] },
  theme?: string
): Promise<string> => {
  try {
    console.log('Saving map with selectedChapters:', selectedChapters);
    const mapData: Omit<ChapterMap, 'id'> = {
      name,
      description,
      userId,
      userName,
      selectedChapters,
      isPublic,
      likes: [],
      chapterAnnotations,
      theme: theme || '',
      createdAt: serverTimestamp() as Timestamp,
      updatedAt: serverTimestamp() as Timestamp,
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
    console.log('Updating map with data:', data);
    const mapRef = doc(db, MAPS_COLLECTION, mapId);
    const updateData = { ...data };
    delete updateData.id;
    delete updateData.createdAt;
    delete updateData.updatedAt;
    
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
  annotations: Annotation[]
): Promise<void> => {
  try {
    const mapRef = doc(db, MAPS_COLLECTION, mapId);
    const mapDoc = await getDoc(mapRef);
    
    if (!mapDoc.exists()) {
      throw new Error('Map not found');
    }

    const mapData = mapDoc.data() as ChapterMap;
    const currentAnnotations = mapData.chapterAnnotations || {};
    
    // If annotations array is empty, remove the chapter entry
    if (annotations.length === 0) {
      const { [chapter]: removed, ...rest } = currentAnnotations;
      await updateDoc(mapRef, {
        chapterAnnotations: rest,
        updatedAt: serverTimestamp()
      });
    } else {
      // Update or add the chapter's annotations
      await updateDoc(mapRef, {
        [`chapterAnnotations.${chapter}`]: annotations,
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