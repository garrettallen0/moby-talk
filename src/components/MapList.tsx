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
                <th>Created By</th>
                <th># of Chapters</th>
                <th>Chapters</th>
                <th>Theme</th>
                <th>Actions</th>
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
                  <td>{map.userName}</td>
                  <td>{map.selectedChapters.length}</td>
                  <td className="chapters-cell">
                    {map.selectedChapters.sort((a, b) => a - b).join(', ')}
                  </td>
                  <td>{map.theme}</td>
                  <td className="actions-cell">
                    <button 
                      className="action-button like-button"
                      onClick={(e) => handleLike(e, map.id)}
                      title="Like"
                    >
                      ↑ {map.likes?.length || 0}
                    </button>
                    <button 
                      className="action-button comment-button"
                      onClick={(e) => handleComment(e, map.id)}
                      title="Comment"
                    >
                      💬 {map.comments?.length || 0}
                    </button>
                    {activeTab === 'my-maps' && (
                      <button 
                        className="action-button delete-button"
                        onClick={(e) => handleDelete(e, map.id)}
                        title="Delete"
                      >
                        🗑️
                      </button>
                    )}
                  </td>
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