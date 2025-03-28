import { useState } from 'react';
import { ChapterMap } from '../types/map';
import { Timestamp } from 'firebase/firestore';
import ForceGraph from './ForceGraph';
import { GraphData } from '../types/graph';
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

  // Convert selectedChapters to graph data
  const graphData: GraphData = {
    nodes: [],
    links: []
  };

  // Add the central theme node with the map's name as the theme
  graphData.nodes.push({
    id: 0,
    chapter: map.name, // Use the map's name as the theme
    connections: map.selectedChapters.length
  });

  // Create nodes for each selected chapter
  map.selectedChapters.forEach(chapter => {
    graphData.nodes.push({
      id: chapter,
      chapter: chapter,
      connections: 1
    });

    // Create links from the theme node to each chapter
    graphData.links.push({
      source: 0, // theme node
      target: chapter
    });
  });

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
        </div>

        <div className="map-preview">
          <div className="mini-graph">
            <ForceGraph
              data={graphData}
              width={200}
              height={150}
              miniature={true}
            />
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