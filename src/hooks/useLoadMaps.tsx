import { useState, useEffect } from 'react';
import { ChapterMap } from '../types/map';
import { getPublicMaps, getUserMaps } from '../services/mapService';
import { useAuth } from '../contexts/AuthContext';

export function useLoadMaps() {
  const { user } = useAuth();
  const [publicMaps, setPublicMaps] = useState<ChapterMap[]>([]);
  const [userMaps, setUserMaps] = useState<ChapterMap[]>([]);

  const fetchPublicMaps = async () => {
    try {
      const maps = await getPublicMaps();
      setPublicMaps(maps);
    } catch (err) {
      console.error('Error loading public maps:', err);
    }
  };

  const fetchUserMaps = async () => {
    if (!user) return;
    try {
      const maps = await getUserMaps(user.uid);
      setUserMaps(maps);
    } catch (err) {
      console.error('Error loading user maps:', err);
    }
  };

  useEffect(() => {
    fetchPublicMaps();
    if (user) {
      fetchUserMaps();
    }
  }, [user]);

  return {
    publicMaps,
    userMaps,
    fetchPublicMaps,
    fetchUserMaps,
  };
}
