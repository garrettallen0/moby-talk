import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  getDocs,
  getDoc,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../firebase';
import { Configuration, ChapterRelationship } from '../types/config';

const COLLECTION_NAME = 'configurations';

export const saveConfiguration = async (
  userId: string,
  name: string,
  relationships: ChapterRelationship[],
  description?: string
): Promise<string> => {
  const config = {
    userId,
    name,
    description,
    relationships,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  };

  const docRef = await addDoc(collection(db, COLLECTION_NAME), config);
  return docRef.id;
};

export const updateConfiguration = async (
  configId: string,
  relationships: ChapterRelationship[],
  name?: string,
  description?: string
): Promise<void> => {
  const configRef = doc(db, COLLECTION_NAME, configId);
  const updates: Partial<Configuration> = {
    relationships,
    updatedAt: Timestamp.now()
  };
  
  if (name) updates.name = name;
  if (description !== undefined) updates.description = description;

  await updateDoc(configRef, updates);
};

export const deleteConfiguration = async (configId: string): Promise<void> => {
  const configRef = doc(db, COLLECTION_NAME, configId);
  await deleteDoc(configRef);
};

export const getUserConfigurations = async (userId: string): Promise<Configuration[]> => {
  const q = query(collection(db, COLLECTION_NAME), where("userId", "==", userId));
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt.toDate(),
    updatedAt: doc.data().updatedAt.toDate()
  })) as Configuration[];
};

export const getConfiguration = async (configId: string): Promise<Configuration | null> => {
  const configRef = doc(db, COLLECTION_NAME, configId);
  const configSnap = await getDoc(configRef);
  
  if (!configSnap.exists()) return null;
  
  const data = configSnap.data();
  return {
    id: configSnap.id,
    ...data,
    createdAt: data.createdAt.toDate(),
    updatedAt: data.updatedAt.toDate()
  } as Configuration;
}; 