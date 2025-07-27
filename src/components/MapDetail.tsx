import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ChapterMap } from "../types/map";
import { getPublicMaps, getUserMaps, toggleLike } from "../services/mapService";
import { useAuth } from "../contexts/AuthContext";
import { Timestamp } from "firebase/firestore";
import { ChapterNavigation } from "./ChapterNavigation";
import { SummaryView } from "./SummaryView";
import { ChapterView } from "./ChapterView";
import { CommentModal } from "./CommentModal";
import { SignInModal } from "./SignInModal";

export function MapDetail() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [map, setMap] = useState<ChapterMap | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
  const [selectedCitations, setSelectedCitations] = useState<Set<number>>(new Set());
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [showSignInModal, setShowSignInModal] = useState(false);

  useEffect(() => {
    const mapId = location.state?.mapId;
    if (!mapId) {
      navigate("/");
      return;
    }

    const loadMap = async () => {
      try {
        // First try to find in public maps
        const publicMaps = await getPublicMaps();
        const foundMap = publicMaps.find((m) => m.id === mapId);

        if (foundMap) {
          setMap(foundMap);
          return;
        }

        // If not found in public maps and user is logged in, try user maps
        if (user) {
          const userMaps = await getUserMaps(user.uid);
          const userMap = userMaps.find((m) => m.id === mapId);
          if (userMap) {
            setMap(userMap);
          }
        }
      } catch (error) {
        console.error("Error loading map:", error);
      }
    };

    loadMap();
  }, [location.state?.mapId, user, navigate]);

  if (!map) {
    return (
      <div className="flex justify-center items-center min-h-48 text-xl text-gray-600">
        Loading...
      </div>
    );
  }

  const formatDate = (date: Date | Timestamp) => {
    if (date instanceof Timestamp) {
      return date.toDate().toLocaleDateString();
    }
    return date.toLocaleDateString();
  };

  const handleChapterClick = (chapter: number) => {
    setSelectedChapter(chapter);
  };

  const handleSummaryClick = () => {
    setSelectedChapter(null);
  };

  const handleBackClick = () => {
    navigate("/");
  };

  const handleEditClick = () => {
    navigate(`/map/${map.id}/edit`);
  };

  const handleCommentClick = () => {
    if (!user) {
      setShowSignInModal(true);
      return;
    }
    setIsCommentModalOpen(true);
  };

  const handleCommentModalClose = () => {
    setIsCommentModalOpen(false);
  };

  const handleCommentAdded = (updatedMap: ChapterMap) => {
    // Update the map state with the new comment
    setMap(updatedMap);
  };

  const handleLikeClick = async () => {
    if (!user) {
      setShowSignInModal(true);
      return;
    }
    
    if (!map) return;
    
    try {
      await toggleLike(map.id, user.uid);
      
      // Update the map locally to reflect the like change
      const likes = map.likes || [];
      const hasLiked = likes.includes(user.uid);
      
      const updatedMap = {
        ...map,
        likes: hasLiked 
          ? likes.filter(id => id !== user.uid)
          : [...likes, user.uid]
      };
      
      setMap(updatedMap);
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const isOwner = user && map.userId === user.uid;

  const handleCitationClick = (index: number) => {
    setSelectedCitations(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 flex flex-col gap-6 md:gap-8 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
      {/* Header - Mobile optimized */}
      <div className="border-b-2 border-gray-200 pb-4">
        {/* Mobile: Stacked layout */}
        <div className="md:hidden flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <button 
              className="px-3 py-2 border border-gray-300 rounded bg-white cursor-pointer transition-all duration-200 text-sm text-gray-600 hover:bg-gray-50 hover:border-blue-500 hover:text-blue-500" 
              onClick={handleBackClick}
            >
              ← Back
            </button>
            {isOwner && (
              <button 
                className="px-3 py-2 border border-blue-500 rounded bg-white text-blue-500 cursor-pointer transition-all duration-200 text-sm hover:bg-blue-500 hover:text-white" 
                onClick={handleEditClick}
              >
                Edit
              </button>
            )}
          </div>
          <h1 className="text-gray-800 text-2xl font-medium text-center">
            {map.name}
          </h1>
        </div>
        
        {/* Desktop: Original layout */}
        <div className="hidden md:flex relative items-center gap-4">
          <button 
            className="relative px-4 py-2 border border-gray-300 rounded bg-white cursor-pointer transition-all duration-200 text-sm text-gray-600 hover:bg-gray-50 hover:border-blue-500 hover:text-blue-500" 
            onClick={handleBackClick}
          >
            ← Back
          </button>
          <h1 className="absolute left-1/2 transform -translate-x-1/2 m-0 text-gray-800 text-3xl font-medium">
            {map.name}
          </h1>
          {isOwner && (
            <button 
              className="absolute right-0 px-4 py-2 border border-blue-500 rounded bg-white text-blue-500 cursor-pointer transition-all duration-200 text-sm hover:bg-blue-500 hover:text-white" 
              onClick={handleEditClick}
            >
              Edit Map
            </button>
          )}
        </div>
      </div>

      <ChapterNavigation
        selectedChapter={selectedChapter}
        chapters={map.selectedChapters}
        onChapterClick={handleChapterClick}
        onSummaryClick={handleSummaryClick}
        variant="detail"
      />

      {/* Content area - Mobile optimized */}
      <div className="flex-1 p-4 md:p-8 overflow-y-auto flex flex-col min-h-0 bg-white border border-gray-200 rounded-lg shadow-sm mx-0 md:mx-4">
        {selectedChapter === null ? (
          <SummaryView map={map} />
        ) : (
          <ChapterView 
            map={map}
            selectedChapter={selectedChapter}
            selectedCitations={selectedCitations}
            onCitationClick={handleCitationClick}
          />
        )}
      </div>

      {/* Theme badge */}
      <div className="inline-flex items-center gap-3 px-5 py-2 bg-purple-100 rounded-full shadow-sm w-fit self-center">
        <p className="m-0 text-purple-800 leading-relaxed text-base whitespace-nowrap">
          {map.theme || "No theme specified."}
        </p>
      </div>

      {/* Footer - Mobile optimized */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pt-4 border-t border-gray-200">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4 w-full md:w-auto">
          <span className="text-gray-600 text-sm">{formatDate(map.createdAt)}</span>
          <span className="text-gray-800 font-medium">{map.userName}</span>
        </div>
        <div className="flex gap-3 md:gap-4 w-full md:w-auto">
          <button 
            onClick={handleLikeClick}
            className={`flex items-center gap-2 px-4 py-2 border border-gray-300 rounded bg-white cursor-pointer transition-all duration-200 text-base flex-1 md:flex-none justify-center ${
              user?.uid && map.likes?.includes(user.uid) 
                ? 'text-blue-500 border-blue-500 hover:bg-blue-50' 
                : 'text-gray-600 hover:bg-gray-50 hover:border-blue-500 hover:text-blue-500'
            }`}
          >
            ↑ {map.likes?.length || 0}
          </button>
          <button 
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded bg-white cursor-pointer transition-all duration-200 text-base text-gray-600 hover:bg-gray-50 hover:border-blue-500 hover:text-blue-500 flex-1 md:flex-none justify-center"
            onClick={handleCommentClick}
          >
            💬 {map.comments?.length || 0}
          </button>
        </div>
      </div>

      {map && (
        <CommentModal
          isOpen={isCommentModalOpen}
          onClose={handleCommentModalClose}
          map={map}
          onCommentAdded={handleCommentAdded}
        />
      )}

      {showSignInModal && (
        <SignInModal
          onClose={() => setShowSignInModal(false)}
        />
      )}
    </div>
  );
}
