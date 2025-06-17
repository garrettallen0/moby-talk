import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChapterMap } from '../types/map';
import { MapList } from './MapList';
import {
  deleteMap,
  toggleLike,
  addComment,
} from '../services/mapService';
import { useAuth } from '../contexts/AuthContext';
import { useLoadMaps } from '../hooks/useLoadMaps';

type ActiveTab = 'public' | 'my-maps';

export function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<ActiveTab>('public');

  const {
    publicMaps,
    userMaps,
    fetchPublicMaps,
    fetchUserMaps,
  } = useLoadMaps();

  const handleGlobalRefresh = async () => {
    await Promise.all([fetchPublicMaps(), fetchUserMaps()]);
  };

  const handleDeleteMap = async (mapId: string) => {
    if (!user) return;

    try {
      await deleteMap(mapId);
      handleGlobalRefresh();
    } catch (error) {
      console.error('Error deleting map:', error);
    }
  };

  const handleLikeMap = async (mapId: string) => {
    if (!user) return;

    try {
      await toggleLike(mapId, user.uid);
      handleGlobalRefresh();
    } catch (error) {
      console.error('Error liking map:', error);
    }
  };

  const handleCommentMap = async (mapId: string, text: string) => {
    if (!user) return;

    try {
      await addComment(mapId, user.uid, user.displayName || 'Anonymous', text);
      handleGlobalRefresh();
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleCreateMap = () => {
    if (!user) return;
    navigate('/map/new', { replace: true });
  };

  const handleMapClick = (map: ChapterMap) => {
    navigate('/map', { state: { mapId: map.id } });
  };

  return (
    <div className="home">
      <MapList
        publicMaps={publicMaps}
        userMaps={userMaps}
        onMapClick={handleMapClick}
        onCreateMap={handleCreateMap}
        onLike={handleLikeMap}
        onComment={handleCommentMap}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onDelete={handleDeleteMap}
      />
    </div>
  );
}
