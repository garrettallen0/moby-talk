import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ChapterMap } from '../types/map';
import { getPublicMaps, getUserMaps } from '../services/mapService';
import { useAuth } from '../contexts/AuthContext';

export function MapDetail() {
  const { mapId } = useParams();
  const { user } = useAuth();
  const [map, setMap] = useState<ChapterMap | null>(null);

  useEffect(() => {
    const loadMap = async () => {
      try {
        // First try to find in public maps
        const publicMaps = await getPublicMaps();
        const foundMap = publicMaps.find(m => m.id === mapId);
        
        if (foundMap) {
          setMap(foundMap);
          return;
        }

        // If not found in public maps and user is logged in, try user maps
        if (user) {
          const userMaps = await getUserMaps(user.uid);
          const userMap = userMaps.find(m => m.id === mapId);
          if (userMap) {
            setMap(userMap);
          }
        }
      } catch (error) {
        console.error('Error loading map:', error);
      }
    };

    loadMap();
  }, [mapId, user]);

  if (!map) {
    return <div>Loading...</div>;
  }

  return (
    <div className="map-detail">
      <h1>{map.name}</h1>
      <p>{map.description}</p>
    </div>
  );
} 