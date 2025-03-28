import { useState } from 'react';
import { ChapterMap, Comment } from '../types/map';
import ForceGraph from './ForceGraph';
import { GraphData } from '../types/graph';

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

        <div className="graph-section">
          <ForceGraph
            data={graphData}
            width={800}
            height={400}
          />
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