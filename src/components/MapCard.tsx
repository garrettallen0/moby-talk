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

  // Convert relationships to graph data
  const graphData: GraphData = {
    nodes: [],
    links: []
  };

  // Create a set of all chapters involved and count connections
  const chapterConnections = new Map<number, number>();
  map.relationships.forEach(rel => {
    chapterConnections.set(rel.sourceChapter, (chapterConnections.get(rel.sourceChapter) || 0) + rel.relatedChapters.length);
    rel.relatedChapters.forEach(chapter => {
      chapterConnections.set(chapter, (chapterConnections.get(chapter) || 0) + 1);
    });
  });

  // Create nodes for each chapter with their connection counts
  chapterConnections.forEach((connections, chapter) => {
    graphData.nodes.push({
      id: chapter,
      chapter: chapter,
      connections: connections
    });
  });

  // Create links directly from relationships
  map.relationships.forEach(rel => {
    rel.relatedChapters.forEach(target => {
      graphData.links.push({
        source: rel.sourceChapter,
        target: target
      });
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
      <div className="map-info">
        <h3>{map.name}</h3>
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