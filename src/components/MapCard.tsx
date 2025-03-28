import { useState } from 'react';
import { ChapterMap } from '../types/map';
import { Timestamp } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { SignInModal } from './SignInModal';
import { CommentModal } from './CommentModal';

interface MapCardProps {
  map: ChapterMap;
  onCardClick: (map: ChapterMap) => void;
  onLike?: (mapId: string) => void;
  onComment?: (mapId: string, text: string) => void;
  isPublicView?: boolean;
}

export const MapCard = ({ map, onCardClick, onLike, onComment, isPublicView = false }: MapCardProps) => {
  const { user, signInWithGoogle } = useAuth();
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false);

  const formatDate = (date: Date | Timestamp) => {
    if (date instanceof Timestamp) {
      return date.toDate().toLocaleDateString();
    }
    return date.toLocaleDateString();
  };

  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!user) {
      setShowSignInModal(true);
      return;
    }

    if (onLike) {
      onLike(map.id);
    }
  };

  const handleCommentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!user) {
      setShowSignInModal(true);
      return;
    }
    
    setShowCommentModal(true);
  };

  const handleSignIn = async () => {
    try {
      await signInWithGoogle();
      setShowSignInModal(false);
      setShowCommentModal(true);
    } catch (error) {
      console.error('Error signing in:', error);
    }
  };

  const hasLiked = user && map.likes?.includes(user.uid);

  return (
    <div 
      className={`map-card ${isPublicView ? 'public-view' : ''}`}
      onClick={() => onCardClick(map)}
      role="button"
      tabIndex={0}
      onKeyPress={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onCardClick(map);
        }
      }}
    >
      <div className="map-content">
        <div className="map-info">
          <h3>{map.name}</h3>
          {map.description && (
            <p className="map-description">{map.description}</p>
          )}
          {map.selectedChapters.length > 0 && (
            <div className="selected-chapters-mini">
              <h4 className="chapters-heading" style={{color: 'black', fontWeight: 'bold'}}>Chapters</h4>
              <div className="chapter-grid">
                {map.selectedChapters.sort((a, b) => a - b).map(chapter => (
                  <button
                    key={chapter}
                    className="chapter-button selected-primary chapter-mini"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {chapter}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="map-preview">
          <div className="chapter-count-display">
            <span className="chapter-count">{map.selectedChapters.length}</span>
            <span className="chapter-label">Chapters</span>
          </div>
        </div>
      </div>

      <div className="map-footer">
        <div className="map-metadata">
          <span className="map-date">{formatDate(map.createdAt)}</span>
          {!isPublicView && (
            <span className={`visibility-badge ${map.isPublic ? 'public' : 'private'}`}>
              {map.isPublic ? 'Public' : 'Private'}
            </span>
          )}
        </div>
        <div className="map-actions">
          <button
            className={`comment-button ${showCommentModal ? 'active' : ''}`}
            onClick={handleCommentClick}
            aria-label="Show comments"
          >
            💬
            <span className="comments-count">{map.comments?.length || 0}</span>
          </button>
          <button 
            className={`upvote-button ${hasLiked ? 'active' : ''}`}
            onClick={handleLikeClick}
            aria-label="Upvote map"
          >
            ↑
            <span className="likes-count">{map.likes?.length || 0}</span>
          </button>
        </div>
      </div>

      {showSignInModal && (
        <SignInModal 
          onClose={() => setShowSignInModal(false)} 
          onSignIn={handleSignIn}
        />
      )}

      {showCommentModal && (
        <CommentModal
          map={map}
          onClose={() => setShowCommentModal(false)}
          onComment={onComment || (() => {})}
        />
      )}
    </div>
  );
}; 