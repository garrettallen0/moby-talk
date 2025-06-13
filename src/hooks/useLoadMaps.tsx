import { useState, useEffect } from 'react';
import { ChapterMap } from '../types/map';
import { getPublicMaps, getUserMaps } from '../services/mapService';
import { User } from 'firebase/auth';

const useLoadMaps = (user: User | null) => {
  const [publicMaps, setPublicMaps] = useState<ChapterMap[]>([]);
  const [userMaps, setUserMaps] = useState<ChapterMap[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchPublicMaps();
    fetchUserMaps();
  });

  const fetchPublicMaps = async () => {
    try {
      setLoading(true);
      setError(null);
      const publicMapsList = await getPublicMaps();
      setPublicMaps(publicMapsList);
    } catch (error) {
      setError(error as Error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserMaps = async () => {
    setLoading(true);
    setError(null);
    try {
      if (user) {
        const userMapsList = await getUserMaps(user.uid);
        setUserMaps(userMapsList);
      } else {
        setUserMaps([]);
      }
    } catch (error) {
      setError(error as Error);
    } finally {
      setLoading(false);
    }
  };

  return {
    publicMaps,
    userMaps,
    fetchPublicMaps,
    fetchUserMaps,
  };
};

export default useLoadMaps;
