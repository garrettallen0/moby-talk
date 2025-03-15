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

  const formatDate = (date: any) => {
    if (date?.toDate) {
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