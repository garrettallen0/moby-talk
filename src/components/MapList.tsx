import { useEffect, useState } from 'react';
import { ChapterMap } from '../types/map';
import { MapCard } from './MapCard';
import { useAuth } from '../contexts/AuthContext';
import { SignInModal } from './SignInModal';

interface MapListProps {
  publicMaps: ChapterMap[];
  userMaps: ChapterMap[];
  onMapClick: (map: ChapterMap) => void;
  onCreateMap: () => void;
  onLike: (mapId: string) => void;
  onComment: (mapId: string, text: string) => void;
  activeTab: 'public' | 'my-maps';
  onTabChange: (tab: 'public' | 'my-maps') => void;
  onDelete?: (mapId: string) => void;
}

export const MapList = ({
  publicMaps,
  userMaps,
  onMapClick,
  onCreateMap,
  onLike,
  onComment,
  activeTab,
  onTabChange,
  onDelete,
}: MapListProps) => {
  const { user } = useAuth();
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [editableUserMaps, setEditableUserMaps] = useState<ChapterMap[]>([]);

  useEffect(() => {
    setEditableUserMaps(userMaps);
  }, [userMaps]);

  const handleCreateClick = () => {
    if (!user) {
      setShowSignInModal(true);
      return;
    }
    onCreateMap();
  };

  const handleUpdateMap = (updateMap: ChapterMap) => {
    setEditableUserMaps((prev) =>
      prev.map((m) => (m.id === updateMap.id ? updateMap : m)),
    );
  };

  return (
    <div className="map-list-container">
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

      <div className="maps-container">
        {activeTab === 'public' ? (
          publicMaps.length > 0 ? (
            publicMaps.map((map) => (
              <MapCard
                key={map.id}
                map={map}
                onCardClick={() => onMapClick(map)}
                onLike={onLike}
                onComment={onComment}
                isPublicView={true}
              />
            ))
          ) : (
            <p className="no-maps-message">No public maps available</p>
          )
        ) : (
          <>
            {editableUserMaps.length > 0 ? (
              editableUserMaps.map((map) => (
                <MapCard
                  key={map.id}
                  map={map}
                  onCardClick={() => onMapClick(map)}
                  onLike={onLike}
                  onComment={onComment}
                  isPublicView={false}
                  onUpdateMap={handleUpdateMap}
                  onDelete={onDelete}
                />
              ))
            ) : (
              <p className="no-maps-message">
                {user
                  ? "You haven't created any maps yet"
                  : 'Sign in to create and view your maps'}
              </p>
            )}
            {user && (
              <button className="add-map-card" onClick={handleCreateClick}>
                <div className="add-map-content">
                  <span className="add-icon">+</span>
                  <span>Create New Map</span>
                </div>
              </button>
            )}
          </>
        )}
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