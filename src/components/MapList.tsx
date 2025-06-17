import { useEffect, useState } from 'react';
import { ChapterMap } from '../types/map';
import { useAuth } from '../contexts/AuthContext';
import { SignInModal } from './SignInModal';
import { MapCard } from './MapCard';
import { MapTable } from './MapTable';
import '../styles/MapList.css';

interface MapListProps {
  publicMaps: ChapterMap[];
  userMaps: ChapterMap[];
  onMapClick: (map: ChapterMap) => void;
  onCreateMap: () => void;
  onLike: (mapId: string) => Promise<void>;
  onComment: (mapId: string, text: string) => Promise<void>;
  onDelete: (mapId: string) => Promise<void>;
  activeTab: 'public' | 'my-maps';
  onTabChange: (tab: 'public' | 'my-maps') => void;
}

export const MapList = ({
  publicMaps,
  userMaps,
  onMapClick,
  onCreateMap,
  onLike,
  onComment,
  onDelete,
  activeTab,
  onTabChange,
}: MapListProps) => {
  const { user } = useAuth();
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [editableUserMaps, setEditableUserMaps] = useState<ChapterMap[]>([]);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    setEditableUserMaps(userMaps);
  }, [userMaps]);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (mobile) {
        setViewMode('cards');
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleCreateClick = () => {
    if (!user) {
      setShowSignInModal(true);
      return;
    }
    onCreateMap();
  };

  const handleLike = async (e: React.MouseEvent, mapId: string) => {
    e.stopPropagation();
    if (!user) {
      setShowSignInModal(true);
      return;
    }
    await onLike(mapId);
  };

  const handleDelete = async (e: React.MouseEvent, mapId: string) => {
    e.stopPropagation();
    if (!user) return;
    if (window.confirm('Are you sure you want to delete this map?')) {
      await onDelete(mapId);
    }
  };

  const handleComment = async (e: React.MouseEvent, mapId: string) => {
    e.stopPropagation();
    if (!user) {
      setShowSignInModal(true);
      return;
    }
    const text = window.prompt('Enter your comment:');
    if (text) {
      await onComment(mapId, text);
    }
  };

  const maps = activeTab === 'public' ? publicMaps : editableUserMaps;
  const showDelete = activeTab === 'my-maps';

  return (
    <div className="map-list-container">
      {!isMobile && (
        <div className="control-panel">
          <h3>Controls</h3>
          <div className="control-section">
            <h4>View Options</h4>
            <div className="view-toggle">
              <button
                className={`toggle-button ${viewMode === 'cards' ? 'active' : ''}`}
                onClick={() => setViewMode('cards')}
                title="Card View"
              >
                <span className="icon">⊞</span>
                Cards
              </button>
              <button
                className={`toggle-button ${viewMode === 'table' ? 'active' : ''}`}
                onClick={() => setViewMode('table')}
                title="Table View"
              >
                <span className="icon">≡</span>
                Table
              </button>
            </div>
          </div>
          {/* Future filter controls will go here */}
        </div>
      )}

      <div className="main-content">
        <div className="map-tabs">
          <button
            className={`tab-button ${activeTab === 'public' ? 'active' : ''}`}
            onClick={() => onTabChange('public')}
          >
            Public Maps
          </button>
          <button
            className={`tab-button ${activeTab === 'my-maps' ? 'active' : ''}`}
            onClick={() => onTabChange('my-maps')}
          >
            My Maps
          </button>
        </div>

        <div className={`maps-container ${viewMode}`}>
          {maps.length > 0 ? (
            viewMode === 'cards' ? (
              <div className="maps-cards">
                {maps.map((map, index) => (
                  <MapCard
                    key={map.id}
                    map={map}
                    index={index}
                    onMapClick={onMapClick}
                    onLike={handleLike}
                    onComment={handleComment}
                    onDelete={handleDelete}
                    showDelete={showDelete}
                  />
                ))}
              </div>
            ) : (
              <MapTable
                maps={maps}
                onMapClick={onMapClick}
                onLike={handleLike}
                onComment={handleComment}
                onDelete={handleDelete}
                showDelete={showDelete}
              />
            )
          ) : (
            <p className="no-maps-message">
              {activeTab === 'public' 
                ? 'No public maps available'
                : user
                  ? "You haven't created any maps yet"
                  : 'Sign in to create and view your maps'
              }
            </p>
          )}
          {user && activeTab === 'my-maps' && (
            <button className="add-map-button" onClick={handleCreateClick}>
              Create New Map
            </button>
          )}
        </div>
      </div>

      {showSignInModal && (
        <SignInModal
          onClose={() => setShowSignInModal(false)}
          onSignIn={() => {
            setShowSignInModal(false);
            onCreateMap();
          }}
        />
      )}
    </div>
  );
};