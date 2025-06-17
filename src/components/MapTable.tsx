import { ChapterMap } from '../types/map';

interface MapTableProps {
  maps: ChapterMap[];
  onMapClick: (map: ChapterMap) => void;
  onLike: (e: React.MouseEvent, mapId: string) => Promise<void>;
  onComment: (e: React.MouseEvent, mapId: string) => Promise<void>;
  onDelete?: (e: React.MouseEvent, mapId: string) => Promise<void>;
  showDelete?: boolean;
}

export const MapTable = ({
  maps,
  onMapClick,
  onLike,
  onComment,
  onDelete,
  showDelete = false,
}: MapTableProps) => {
  return (
    <div className="maps-table-container">
      <table className="maps-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Created By</th>
            <th># of Chapters</th>
            <th>Chapters</th>
            <th>Theme</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {maps.map((map, index) => (
            <tr 
              key={map.id} 
              onClick={() => onMapClick(map)}
              className="map-row"
            >
              <td data-label="#">{index + 1}</td>
              <td data-label="Name">{map.name}</td>
              <td data-label="Created By">{map.userName}</td>
              <td data-label="# of Chapters">{map.selectedChapters.length}</td>
              <td data-label="Chapters" className="chapters-cell">
                {map.selectedChapters.sort((a, b) => a - b).join(', ')}
              </td>
              <td data-label="Theme">{map.theme}</td>
              <td className="actions-cell">
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
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}; 