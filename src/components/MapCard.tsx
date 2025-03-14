import { ChapterMap } from '../types/map';
import { Timestamp } from 'firebase/firestore';

interface MapCardProps {
  map: ChapterMap;
  onView: (map: ChapterMap) => void;
  onEdit?: (map: ChapterMap) => void;
  onDelete?: (mapId: string) => void;
}

export const MapCard = ({ map, onView, onEdit, onDelete }: MapCardProps) => {
  const isOwner = onEdit && onDelete;

  const formatDate = (date: Date | Timestamp) => {
    if (date instanceof Timestamp) {
      return date.toDate().toLocaleDateString();
    }
    return date.toLocaleDateString();
  };

  return (
    <div className="map-card">
      <div className="map-info">
        <h3>{map.name}</h3>
        {map.description && <p>{map.description}</p>}
        <div className="map-metadata">
          <span className="map-date">Created: {formatDate(map.createdAt)}</span>
          <span className={`visibility-badge ${map.isPublic ? 'public' : 'private'}`}>
            {map.isPublic ? 'Public' : 'Private'}
          </span>
        </div>
      </div>
      <div className="map-actions">
        <button onClick={() => onView(map)} className="view-map-button">
          View
        </button>
        {isOwner && (
          <>
            <button onClick={() => onEdit(map)} className="edit-map-button">
              Edit
            </button>
            <button onClick={() => onDelete(map.id)} className="delete-map-button">
              Delete
            </button>
          </>
        )}
      </div>
    </div>
  );
}; 