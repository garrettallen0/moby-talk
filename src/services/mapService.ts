import { db } from '../firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, where, serverTimestamp, Timestamp } from 'firebase/firestore';
import { ChapterMap } from '../types/map';

const MAPS_COLLECTION = 'maps';

export const saveMap = async (
  userId: string,
  name: string,
  relationships: { sourceChapter: number; relatedChapters: number[] }[],
  description?: string,
  isPublic: boolean = false
): Promise<string> => {
  try {
    const mapData: Omit<ChapterMap, 'id'> = {
      name,
      description,
      userId,
      relationships,
      isPublic,
      createdAt: serverTimestamp() as Timestamp,
      updatedAt: serverTimestamp() as Timestamp,
    };

    console.log('Debug - Attempting to save map data:', {
      collection: MAPS_COLLECTION,
      userId,
      name,
      relationshipsCount: relationships.length,
      isPublic
    });

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
    await updateDoc(mapRef, {
      ...data,
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