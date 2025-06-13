import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChapterMap } from '../types/map';
import { MapList } from './MapList';
import {
  saveMap,
  deleteMap,
  toggleLike,
  addComment,
} from '../services/mapService';
import { useAuth } from '../contexts/AuthContext';
import { MapEditorModal } from './MapEditorModal';
import useLoadMaps from '../hooks/useLoadMaps';

type ActiveTab = 'public' | 'my-maps';

export function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<ActiveTab>('public');
  const [selectedMap, setSelectedMap] = useState<ChapterMap | null>(null);

  const {
    publicMaps,
    userMaps,
    fetchPublicMaps,
    fetchUserMaps,
    loading, //TODO placeholder to add spinner
    error, //TODO error handling
  } = useLoadMaps(user);

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

  const handleSaveMap = async (map: ChapterMap) => {
    if (user) {
      await saveMap(
        user.uid,
        map.name,
        map.selectedChapters,
        map.description,
        map.isPublic,
        map.chapterAnnotations,
      );
    }

    handleGlobalRefresh();
  };

  const handleCreateMap = () => {
    if (!user) return;

    const newMap: ChapterMap = {
      id: '', // Will be set by Firestore
      name: '',
      description: '',
      userId: user.uid,
      selectedChapters: [],
      isPublic: false,
      likes: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setSelectedMap(newMap);
  };

  const handleMapClick = (map: ChapterMap) => {
    navigate('/map', { state: { mapId: map.id } });
  };

  return (
    <div className="home">
      <h1>Moby Talk</h1>
      <h4>Out of the trunk, the branches grow; out of them, the twigs.</h4>

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

      {selectedMap && (
        <MapEditorModal
          map={selectedMap}
          onClose={() => {
            setSelectedMap(null);
          }}
          onSave={handleSaveMap}
          onDelete={handleDeleteMap}
        />
      )}
    </div>
  );
}
