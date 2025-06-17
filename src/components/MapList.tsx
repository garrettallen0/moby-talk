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
                  <div 
                    key={map.id} 
                    className="map-card"
                    onClick={() => onMapClick(map)}
                  >
                    <div className="card-header">
                      <span className="card-number">#{index + 1}</span>
                      <h3 className="card-title">{map.name}</h3>
                    </div>
                    <div className="card-content">
                      <div className="card-field">
                        <label>Created By</label>
                        <span>{map.userName}</span>
                      </div>
                      <div className="card-field">
                        <label># of Chapters</label>
                        <span>{map.selectedChapters.length}</span>
                      </div>
                      <div className="card-field">
                        <label>Chapters</label>
                        <span className="chapters-list">
                          {map.selectedChapters.sort((a, b) => a - b).join(', ')}
                        </span>
                      </div>
                      <div className="card-field">
                        <label>Theme</label>
                        <span>{map.theme}</span>
                      </div>
                    </div>
                    <div className="card-actions">
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
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="maps-table-container">
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
                        <td data-label="#">{index + 1}</td>
                        <td data-label="Name">{map.name}</td>
                        <td data-label="Created By">{map.userName}</td>
                        <td data-label="# of Chapters">{map.selectedChapters.length}</td>
                        <td data-label="Chapters" className="chapters-cell">
                          {map.selectedChapters.sort((a, b) => a - b).join(', ')}
                        </td>
                        <td data-label="Theme">{map.theme}</td>
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
              </div>
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