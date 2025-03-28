import { useState } from 'react';
import { ChapterMap, Comment } from '../types/map';

interface CommentModalProps {
  map: ChapterMap;
  onClose: () => void;
  onComment: (mapId: string, text: string) => void;
}

export const CommentModal = ({ map, onClose, onComment }: CommentModalProps) => {
  const [newComment, setNewComment] = useState('');

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      onComment(map.id, newComment.trim());
      setNewComment('');
    }
  };

  const formatDate = (date: Date | { toDate: () => Date }) => {
    if (typeof date === 'object' && 'toDate' in date) {
      return date.toDate().toLocaleDateString();
    }
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="comment-modal">
      <div className="modal-overlay" onClick={onClose} />
      <div className="modal-content">
        <div className="modal-header">
          <h2>{map.name}</h2>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>

        <div className="theme-summary">
          <h3>Theme Info</h3>
          <p>{map.description || 'No description provided'}</p>
          <p className="chapter-summary">
            Chapters: {map.selectedChapters.length > 0 
              ? map.selectedChapters.sort((a, b) => a - b).join(', ') 
              : 'None'}
          </p>
        </div>

        <div className="comments-section">
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
            {(!map.comments || map.comments.length === 0) && (
              <p>No comments yet. Be the first to comment!</p>
            )}
          </div>
        </div>

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
      </div>
    </div>
  );
}; 