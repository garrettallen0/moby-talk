import { useState, useEffect } from 'react';
import { ChapterMap } from '../types/map';
import { getPublicMaps, getUserMaps } from '../services/mapService';
import { useAuth } from '../contexts/AuthContext';

export function useLoadMaps() {
  const { user } = useAuth();
  const [maps, setMaps] = useState<ChapterMap[]>([]);

  useEffect(() => {
    const loadMaps = async () => {
      try {
        const publicMaps = await getPublicMaps();
        if (user) {
          const userMaps = await getUserMaps(user.uid);
          setMaps([...publicMaps, ...userMaps]);
        } else {
          setMaps(publicMaps);
        }
      } catch (err) {
        console.error('Error loading maps:', err);
      }
    };

    loadMaps();
  }, [user]);

  return maps;
}
