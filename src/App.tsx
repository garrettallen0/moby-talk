import { useState, useEffect } from 'react'
import './App.css'
import { AuthButton } from './components/AuthButton'
import { useAuth } from './contexts/AuthContext'
import { ChapterMap } from './types/map'
import { MapList } from './components/MapList'
import { 
  saveMap, 
  getPublicMaps, 
  getUserMaps, 
  deleteMap, 
  updateMap, 
  toggleLike,
  addComment 
} from './services/mapService'
import { MapEditorModal } from './components/MapEditorModal'

type ActiveTab = 'public' | 'my-maps';

function App() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<ActiveTab>('public');
  const [isCreatingMap, setIsCreatingMap] = useState(false);
  const [publicMaps, setPublicMaps] = useState<ChapterMap[]>([]);
  const [userMaps, setUserMaps] = useState<ChapterMap[]>([]);
  const [selectedMap, setSelectedMap] = useState<ChapterMap | null>(null);

  useEffect(() => {
    // Load public maps
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

  const handleSaveMap = async (map: ChapterMap) => {
    if (!user) return;
    
    try {
      await saveMap(
        user.uid,
        map.name,
        map.relationships,
        map.description,
        map.isPublic
      );

      // Reset state
      setIsCreatingMap(false);
      setSelectedMap(null);

      // Reload maps
      const [newPublicMaps, newUserMaps] = await Promise.all([
        getPublicMaps(),
        getUserMaps(user.uid)
      ]);
      setPublicMaps(newPublicMaps);
      setUserMaps(newUserMaps);
    } catch (error) {
      console.error('Error saving map:', error);
    }
  };

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

  const handleEditMap = async (map: ChapterMap) => {
    if (!user) return;
    
    try {
      await updateMap(map.id, map);
      
      // Reload maps after update
      const [newPublicMaps, newUserMaps] = await Promise.all([
        getPublicMaps(),
        getUserMaps(user.uid)
      ]);
      setPublicMaps(newPublicMaps);
      setUserMaps(newUserMaps);
      setSelectedMap(null);
    } catch (error) {
      console.error('Error updating map:', error);
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

  const handleTabChange = (tab: 'public' | 'my-maps') => {
    setActiveTab(tab);
  };

  const handleCreateMap = () => {
    if (!user) return;
    
    const newMap: ChapterMap = {
      id: '', // Will be set by Firestore
      name: '',
      description: '',
      userId: user.uid,
      relationships: [],
      isPublic: false,
      likes: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    setSelectedMap(newMap);
    setIsCreatingMap(true);
  };

  return (
    <div className="container">
      <AuthButton />
      <h1>Moby-Dick Chapter Relationships</h1>
      
      <MapList
        publicMaps={publicMaps}
        userMaps={userMaps}
        onViewMap={setSelectedMap}
        onEditMap={setSelectedMap}
        onDeleteMap={handleDeleteMap}
        onCreateMap={handleCreateMap}
        onLike={handleLikeMap}
        onComment={handleCommentMap}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />

      {selectedMap && (
        <MapEditorModal
          map={selectedMap}
          onClose={() => {
            setSelectedMap(null);
            setIsCreatingMap(false);
          }}
          onSave={isCreatingMap ? handleSaveMap : handleEditMap}
          onDelete={handleDeleteMap}
          isPublicView={activeTab === 'public'}
        />
      )}
    </div>
  )
}

export default App
