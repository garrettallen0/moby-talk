import { useEffect, useState } from 'react';
import { ChapterMap } from '../types/map';
import { useAuth } from '../contexts/AuthContext';
import { SignInModal } from './SignInModal';
import '../styles/MapList.css';

interface MapListProps {
  publicMaps: ChapterMap[];
  userMaps: ChapterMap[];
  onMapClick: (map: ChapterMap) => void;
  onCreateMap: () => void;
  activeTab: 'public' | 'my-maps';
  onTabChange: (tab: 'public' | 'my-maps') => void;
}

export const MapList = ({
  publicMaps,
  userMaps,
  onMapClick,
  onCreateMap,
  activeTab,
  onTabChange,
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

  const maps = activeTab === 'public' ? publicMaps : editableUserMaps;

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

      <div className="maps-table-container">
        {maps.length > 0 ? (
          <table className="maps-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th># of Chapters</th>
                <th>Chapters</th>
                <th>↑</th>
                <th>💬</th>
              </tr>
            </thead>
            <tbody>
              {maps.map((map, index) => (
                <tr 
                  key={map.id} 
                  onClick={() => onMapClick(map)}
                  className="map-row"
                >
                  <td>{index + 1}</td>
                  <td>{map.name}</td>
                  <td>{map.selectedChapters.length}</td>
                  <td className="chapters-cell">
                    {map.selectedChapters.sort((a, b) => a - b).join(', ')}
                  </td>
                  <td>{map.likes?.length || 0}</td>
                  <td>{map.comments?.length || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
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