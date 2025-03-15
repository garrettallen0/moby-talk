import { useState } from 'react';
import { ChapterMap, Comment } from '../types/map';
import { Timestamp } from 'firebase/firestore';
import ForceGraph from './ForceGraph';
import { GraphData } from '../types/graph';
import { useAuth } from '../contexts/AuthContext';
import { SignInModal } from './SignInModal';

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
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');

  const formatDate = (date: Date | Timestamp) => {
    if (date instanceof Timestamp) {
      return date.toDate().toLocaleDateString();
    }
    return date.toLocaleDateString();
  };

  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the card click
    
    if (!user) {
      setShowSignInModal(true);
      return;
    }

    if (onLike) {
      onLike(map.id);
    }
  };

  const handleCommentClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the card click
    
    if (!user) {
      setShowSignInModal(true);
      return;
    }
    
    setShowComments(!showComments);
  };

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent triggering the card click
    
    if (onComment && newComment.trim()) {
      onComment(map.id, newComment.trim());
      setNewComment('');
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
    // Add source chapter and increment its connections count
    chapterConnections.set(rel.sourceChapter, (chapterConnections.get(rel.sourceChapter) || 0) + rel.relatedChapters.length);
    // Add each related chapter and increment their connections count
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

  const handleSignIn = async () => {
    try {
      await signInWithGoogle();
      setShowSignInModal(false);
      setShowComments(true);
    } catch (error) {
      console.error('Error signing in:', error);
    }
  };

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
      <div className="mini-graph">
        <ForceGraph
          data={graphData}
          width={200}
          height={150}
          miniature={true}
        />
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
            className={`upvote-button ${hasLiked ? 'active' : ''}`}
            onClick={handleLikeClick}
            aria-label="Upvote map"
          >
            ↑
            <span className="likes-count">{map.likes?.length || 0}</span>
          </button>
          <button
            className={`comment-button ${showComments ? 'active' : ''}`}
            onClick={handleCommentClick}
            aria-label="Show comments"
          >
            💬
            <span className="comments-count">{map.comments?.length || 0}</span>
          </button>
        </div>
      </div>

      {showComments && (
        <div className="comments-section" onClick={e => e.stopPropagation()}>
          <div className="comments-list">
            {map.comments?.map((comment: Comment) => (
              <div key={comment.id} className="comment">
                <div className="comment-header">
                  <span className="comment-author">{comment.userName}</span>
                  <span className="comment-date">{formatDate(comment.createdAt)}</span>
                </div>
                <p className="comment-text">{comment.text}</p>
              </div>
            ))}
          </div>
          {user && (
            <form className="comment-form" onSubmit={handleSubmitComment}>
              <input
                type="text"
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="comment-input"
              />
              <button 
                type="submit" 
                className="comment-submit"
                disabled={!newComment.trim()}
              >
                Post
              </button>
            </form>
          )}
        </div>
      )}

      {showSignInModal && (
        <SignInModal 
          onClose={() => setShowSignInModal(false)} 
          onSignIn={handleSignIn}
        />
      )}
    </div>
  );
}; 