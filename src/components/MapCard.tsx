import { ChapterMap } from '../types/map';

interface MapCardProps {
  map: ChapterMap;
  onMapClick: (map: ChapterMap) => void;
  onLike: (e: React.MouseEvent, mapId: string) => Promise<void>;
  onComment: (e: React.MouseEvent, mapId: string) => Promise<void>;
  onDelete?: (e: React.MouseEvent, mapId: string) => Promise<void>;
  showDelete?: boolean;
  index?: number; // Add index for card number display
}

export const MapCard = ({
  map,
  onMapClick,
  onLike,
  onComment,
  onDelete,
  showDelete = false,
  index,
}: MapCardProps) => {
  return (
    <div 
      className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden hover:-translate-y-0.5"
      onClick={() => onMapClick(map)}
    >
      <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center gap-2">
        <div className="flex items-center gap-2">
          {index !== undefined && (
            <span className="text-gray-600 text-sm">#{index + 1}</span>
          )}
          <h3 className="m-0 text-lg text-gray-800 font-medium">{map.name}</h3>
        </div>
        {map.theme && (
          <div className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
            {map.theme}
          </div>
        )}
      </div>
      <div className="p-4">
        {map.shortDescription && (
          <div className="flex mb-3 last:mb-0">
          <label className="w-2/5 text-gray-600 text-sm">Summary</label>
          <span className="flex-1 text-gray-800">{map.shortDescription}</span>
        </div>
        )}
        <div className="flex mb-3 last:mb-0">
          <label className="w-2/5 text-gray-600 text-sm"># of Chapters</label>
          <span className="flex-1 text-gray-800">{map.selectedChapters.length}</span>
        </div>
        <div className="flex mb-3 last:mb-0">
          <label className="w-2/5 text-gray-600 text-sm">Chapters</label>
          <span className="flex-1 text-gray-800 block whitespace-nowrap overflow-hidden text-ellipsis">
            {map.selectedChapters.sort((a, b) => a - b).join(', ')}
          </span>
        </div>
      </div>
      <div className="p-4 border-t border-gray-200 flex justify-between items-center gap-2">
        <span className="text-gray-600 text-sm">{map.userName}</span>
        <div className="flex gap-2">
          <button 
            className="px-2 py-1 border-none rounded bg-transparent text-blue-500 text-sm cursor-pointer transition-all duration-200 hover:bg-gray-100"
            onClick={(e) => onLike(e, map.id)}
            title="Like"
          >
            ↑ {map.likes?.length || 0}
          </button>
          <button 
            className="px-2 py-1 border-none rounded bg-transparent text-green-500 text-sm cursor-pointer transition-all duration-200 hover:bg-gray-100"
            onClick={(e) => onComment(e, map.id)}
            title="Comment"
          >
            💬 {map.comments?.length || 0}
          </button>
          {showDelete && onDelete && (
            <button 
              className="px-2 py-1 border-none rounded bg-transparent text-red-500 text-sm cursor-pointer transition-all duration-200 hover:bg-gray-100"
              onClick={(e) => onDelete(e, map.id)}
              title="Delete"
            >
              🗑️
            </button>
          )}
        </div>
      </div>
    </div>
  );
}; 