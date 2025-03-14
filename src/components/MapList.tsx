import { useState } from 'react';
import { ChapterMap } from '../types/map';
import { MapCard } from './MapCard';
import { useAuth } from '../contexts/AuthContext';
import { SignInModal } from './SignInModal';

interface MapListProps {
  publicMaps: ChapterMap[];
  userMaps: ChapterMap[];
  onViewMap: (map: ChapterMap) => void;
  onEditMap: (map: ChapterMap) => void;
  onDeleteMap: (mapId: string) => void;
  onCreateMap: () => void;
  activeTab: 'public' | 'my-maps';
  onTabChange: (tab: 'public' | 'my-maps') => void;
}

export const MapList = ({
  publicMaps,
  userMaps,
  onViewMap,
  onEditMap,
  onDeleteMap,
  onCreateMap,
  activeTab,
  onTabChange
}: MapListProps) => {
  const { user } = useAuth();
  const [showSignInModal, setShowSignInModal] = useState(false);

  const handleCreateMap = () => {
    if (!user) {
      setShowSignInModal(true);
      return;
    }
    onCreateMap();
  };

  const handleSignIn = () => {
    // Trigger Google sign-in
    document.querySelector('.login-button')?.click();
    setShowSignInModal(false);
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
            publicMaps.map(map => (
              <MapCard
                key={map.id}
                map={map}
                onView={onViewMap}
                onEdit={map.userId === user?.uid ? onEditMap : undefined}
                onDelete={map.userId === user?.uid ? onDeleteMap : undefined}
                isPublicView={true}
              />
            ))
          ) : (
            <div className="no-maps-message">No public maps available</div>
          )
        ) : (
          <>
            {userMaps.map(map => (
              <MapCard
                key={map.id}
                map={map}
                onView={onViewMap}
                onEdit={onEditMap}
                onDelete={onDeleteMap}
                isPublicView={false}
              />
            ))}
            <div className="add-map-card" onClick={handleCreateMap}>
              <div className="add-map-content">
                <span className="add-icon">+</span>
                <span>Add a map</span>
              </div>
            </div>
          </>
        )}
      </div>

      {showSignInModal && (
        <SignInModal
          onClose={() => setShowSignInModal(false)}
          onSignIn={handleSignIn}
        />
      )}
    </div>
  );
}; 