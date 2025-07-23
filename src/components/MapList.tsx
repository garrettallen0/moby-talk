import { useEffect, useState } from 'react';
import { ChapterMap } from '../types/map';
import { useAuth } from '../contexts/AuthContext';
import { SignInModal } from './SignInModal';
import { MapCard } from './MapCard';
import { CommentModal } from './CommentModal';

interface MapListProps {
  publicMaps: ChapterMap[];
  userMaps: ChapterMap[];
  onMapClick: (map: ChapterMap) => void;
  onCreateMap: () => void;
  onLike: (mapId: string) => Promise<void>;
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
  onDelete,
  activeTab,
  onTabChange,
}: MapListProps) => {
  const { user } = useAuth();
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [editableUserMaps, setEditableUserMaps] = useState<ChapterMap[]>([]);
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [selectedMapForComment, setSelectedMapForComment] = useState<ChapterMap | null>(null);

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
    const map = maps.find(m => m.id === mapId);
    if (map) {
      setSelectedMapForComment(map);
      setIsCommentModalOpen(true);
    }
  };

  const handleCommentModalClose = () => {
    setIsCommentModalOpen(false);
    setSelectedMapForComment(null);
  };

  const handleCommentAdded = (updatedMap: ChapterMap) => {
    // Update the selected map for comment to show the new comment immediately
    setSelectedMapForComment(updatedMap);
  };

  const maps = activeTab === 'public' ? publicMaps : editableUserMaps;
  const showDelete = activeTab === 'my-maps';

  return (
    <div className="w-full mx-auto my-8 flex gap-8 md:flex-col md:gap-4 lg:px-16">
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

        <div>
          {maps.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 p-4 md:p-2">
              {maps.map((map, index) => (
                <MapCard
                  key={map.id}
                  map={map}
                  onMapClick={onMapClick}
                  onLike={handleLike}
                  onComment={handleComment}
                  onDelete={handleDelete}
                  showDelete={showDelete}
                  index={index}
                />
              ))}
            </div>
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
        />
      )}

      {selectedMapForComment && (
        <CommentModal
          isOpen={isCommentModalOpen}
          onClose={handleCommentModalClose}
          map={selectedMapForComment}
          onCommentAdded={handleCommentAdded}
        />
      )}
    </div>
  );
};