import { ChapterMap } from '../types/map';

interface MapCardProps {
  map: ChapterMap;
  index: number;
  onMapClick: (map: ChapterMap) => void;
  onLike: (e: React.MouseEvent, mapId: string) => Promise<void>;
  onComment: (e: React.MouseEvent, mapId: string) => Promise<void>;
  onDelete?: (e: React.MouseEvent, mapId: string) => Promise<void>;
  showDelete?: boolean;
}

export const MapCard = ({
  map,
  index,
  onMapClick,
  onLike,
  onComment,
  onDelete,
  showDelete = false,
}: MapCardProps) => {
  return (
    <div 
      className="map-card"
      onClick={() => onMapClick(map)}
    >
      <div className="card-header">
        <span className="card-number">#{index + 1}</span>
        <h3 className="card-title">{map.name}</h3>
      </div>
      <div className="card-content">
        <div className="card-field">
          <label>Created By</label>
          <span>{map.userName}</span>
        </div>
        <div className="card-field">
          <label># of Chapters</label>
          <span>{map.selectedChapters.length}</span>
        </div>
        <div className="card-field">
          <label>Chapters</label>
          <span className="chapters-list">
            {map.selectedChapters.sort((a, b) => a - b).join(', ')}
          </span>
        </div>
        <div className="card-field">
          <label>Theme</label>
          <span>{map.theme}</span>
        </div>
      </div>
      <div className="card-actions">
        <button 
          className="action-button like-button"
          onClick={(e) => onLike(e, map.id)}
          title="Like"
        >
          ↑ {map.likes?.length || 0}
        </button>
        <button 
          className="action-button comment-button"
          onClick={(e) => onComment(e, map.id)}
          title="Comment"
        >
          💬 {map.comments?.length || 0}
        </button>
        {showDelete && onDelete && (
          <button 
            className="action-button delete-button"
            onClick={(e) => onDelete(e, map.id)}
            title="Delete"
          >
            🗑️
          </button>
        )}
      </div>
    </div>
  );
}; 