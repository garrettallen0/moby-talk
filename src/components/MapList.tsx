import { useEffect, useState } from 'react';
import { ChapterMap } from '../types/map';
import { useAuth } from '../contexts/AuthContext';
import { SignInModal } from './SignInModal';
import { MapCard } from './MapCard';
import { MapTable } from './MapTable';

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
    <div className="w-full mx-auto my-8 flex gap-8 md:flex-col md:gap-4">
      {!isMobile && (
        <div className="w-64 flex-shrink-0 bg-white rounded-lg shadow-sm p-6 md:w-full md:p-4">
          <h3 className="m-0 mb-4 text-gray-800 text-lg font-medium">Controls</h3>
          <div className="mb-6 last:mb-0">
            <h4 className="m-0 mb-3 text-gray-600 text-sm font-medium">View Options</h4>
            <div className="flex gap-2">
              <button
                className={`flex items-center gap-2 px-4 py-3 border rounded-md bg-white text-gray-600 cursor-pointer transition-all duration-200 text-sm w-full hover:border-blue-500 hover:text-blue-500 ${
                  viewMode === 'cards' ? 'bg-blue-500 text-white border-blue-500' : 'border-gray-300'
                }`}
                onClick={() => setViewMode('cards')}
                title="Card View"
              >
                <span className="text-lg">⊞</span>
                Cards
              </button>
              <button
                className={`flex items-center gap-2 px-4 py-3 border rounded-md bg-white text-gray-600 cursor-pointer transition-all duration-200 text-sm w-full hover:border-blue-500 hover:text-blue-500 ${
                  viewMode === 'table' ? 'bg-blue-500 text-white border-blue-500' : 'border-gray-300'
                }`}
                onClick={() => setViewMode('table')}
                title="Table View"
              >
                <span className="text-lg">≡</span>
                Table
              </button>
            </div>
          </div>
          {/* Future filter controls will go here */}
        </div>
      )}

      <div className="flex-1 min-w-0">
        <div className="flex mb-4 border-b-2 border-gray-300 pb-2">
          <button
            className={`flex-1 px-6 py-3 border-none bg-transparent text-lg text-gray-600 cursor-pointer transition-all duration-200 relative m-0 hover:text-blue-500 ${
              activeTab === 'public' ? 'text-blue-500 font-medium' : ''
            }`}
            onClick={() => onTabChange('public')}
          >
            Public Maps
            {activeTab === 'public' && (
              <div className="absolute bottom-[-8px] left-0 w-full h-0.5 bg-blue-500"></div>
            )}
          </button>
          <button
            className={`flex-1 px-6 py-3 border-none bg-transparent text-lg text-gray-600 cursor-pointer transition-all duration-200 relative m-0 hover:text-blue-500 ${
              activeTab === 'my-maps' ? 'text-blue-500 font-medium' : ''
            }`}
            onClick={() => onTabChange('my-maps')}
          >
            My Maps
            {activeTab === 'my-maps' && (
              <div className="absolute bottom-[-8px] left-0 w-full h-0.5 bg-blue-500"></div>
            )}
          </button>
        </div>

        <div className={viewMode}>
          {maps.length > 0 ? (
            viewMode === 'cards' ? (
              <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 p-4 md:p-2">
                {maps.map((map) => (
                  <MapCard
                    key={map.id}
                    map={map}
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
            <p className="text-center py-10 text-gray-600 italic">
              {activeTab === 'public' 
                ? 'No public maps available'
                : user
                  ? "You haven't created any maps yet"
                  : 'Sign in to create and view your maps'
              }
            </p>
          )}
          {user && activeTab === 'my-maps' && (
            <button 
              className="mt-5 px-5 py-2.5 bg-blue-500 text-white border-none rounded cursor-pointer text-sm transition-colors duration-200 hover:bg-blue-700" 
              onClick={handleCreateClick}
            >
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