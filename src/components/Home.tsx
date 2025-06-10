import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChapterMap } from '../types/map';
import { MapList } from './MapList';
import { 
  getPublicMaps, 
  getUserMaps, 
  deleteMap, 
  toggleLike,
  addComment 
} from '../services/mapService';
import { useAuth } from '../contexts/AuthContext';
import { MapEditorModal } from './MapEditorModal';

type ActiveTab = 'public' | 'my-maps';

export function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<ActiveTab>('public');
  const [isCreatingMap, setIsCreatingMap] = useState(false);
  const [publicMaps, setPublicMaps] = useState<ChapterMap[]>([]);
  const [userMaps, setUserMaps] = useState<ChapterMap[]>([]);
  const [selectedMap, setSelectedMap] = useState<ChapterMap | null>(null);

  useEffect(() => {
    const loadMaps = async () => {
      try {
        const publicMapsList = await getPublicMaps();
        setPublicMaps(publicMapsList);

        if (user) {
          const userMapsList = await getUserMaps(user.uid);
          setUserMaps(userMapsList);
        } else {
          setUserMaps([]);
        }
      } catch (error) {
        console.error('Error loading maps:', error);
      }
    };

    loadMaps();
  }, [user]);

  const handleDeleteMap = async (mapId: string) => {
    if (!user) return;
    
    try {
      await deleteMap(mapId);
      
      // Reload maps
      const [newPublicMaps, newUserMaps] = await Promise.all([
        getPublicMaps(),
        getUserMaps(user.uid)
      ]);
      setPublicMaps(newPublicMaps);
      setUserMaps(newUserMaps);
    } catch (error) {
      console.error('Error deleting map:', error);
    }
  };

  const handleLikeMap = async (mapId: string) => {
    if (!user) return;
    
    try {
      await toggleLike(mapId, user.uid);
      
      // Reload maps after like
      const [newPublicMaps, newUserMaps] = await Promise.all([
        getPublicMaps(),
        getUserMaps(user.uid)
      ]);
      setPublicMaps(newPublicMaps);
      setUserMaps(newUserMaps);
    } catch (error) {
      console.error('Error liking map:', error);
    }
  };

  const handleCommentMap = async (mapId: string, text: string) => {
    if (!user) return;
    
    try {
      await addComment(mapId, user.uid, user.displayName || 'Anonymous', text);
      
      // Reload maps after comment
      const [newPublicMaps, newUserMaps] = await Promise.all([
        getPublicMaps(),
        getUserMaps(user.uid)
      ]);
      setPublicMaps(newPublicMaps);
      setUserMaps(newUserMaps);
    } catch (error) {
      console.error('Error adding comment:', error);
    }
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
      updatedAt: new Date()
    };
    
    setSelectedMap(newMap);
    setIsCreatingMap(true);
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
            setIsCreatingMap(false);
          }}
          onSave={handleCreateMap}
          onDelete={handleDeleteMap}
        />
      )}
    </div>
  );
} 