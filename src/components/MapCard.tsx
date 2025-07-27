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
  // Common button base styles
  const buttonBaseClasses = "flex items-center gap-1 px-3 py-1.5 text-gray-500 rounded-lg transition-all duration-200 hover:scale-105";
  
  return (
    <div 
      className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden hover:-translate-y-1 border-2 border-gray-300 flex flex-col h-full group"
      onClick={() => onMapClick(map)}
    >
      <div className="p-4 bg-blue-100 border-b border-blue-200 flex justify-between items-center gap-2">
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
      <div className="p-4 flex-1 bg-white">
        {map.shortDescription && (
          <div className="flex mb-3 last:mb-0">
          <label className="w-2/5 text-gray-600 text-sm font-medium">Summary</label>
          <span className="flex-1 text-gray-700 leading-relaxed">{map.shortDescription}</span>
        </div>
        )}
      </div>
      <div className="p-4 border-t border-gray-100 bg-gradient-to-r from-gray-50 to-white">
        <div className="flex items-center gap-2 mb-2">
          <label className="text-gray-600 text-sm font-medium">Chapters</label>
        </div>
        <div className="flex justify-between items-center gap-2">
          <span className="text-gray-700 text-sm flex-1">
            {map.selectedChapters.sort((a, b) => a - b).join(', ')}
          </span>
          <span className="text-blue-600 font-semibold bg-blue-100 border border-blue-200 rounded-full w-8 h-8 flex items-center justify-center text-sm">{map.selectedChapters.length}</span>
        </div>
      </div>
      
      <div className="p-4 border-t border-gray-100 flex justify-between items-center gap-2 bg-gradient-to-r from-gray-50 to-white">
        <span className="text-gray-600 text-sm font-medium">{map.userName}</span>
        <div className="flex gap-3">
          <button 
            className={`${buttonBaseClasses} hover:text-blue-600 hover:bg-blue-50`}
            onClick={(e) => onLike(e, map.id)}
            title="Like"
          >
            <span className="text-sm">↑</span>
            <span className="text-xs font-semibold">{map.likes?.length || 0}</span>
          </button>
          <button 
            className={`${buttonBaseClasses} hover:text-green-600 hover:bg-green-50`}
            onClick={(e) => onComment(e, map.id)}
            title="Comment"
          >
            <span className="text-sm">💬</span>
            <span className="text-xs font-semibold">{map.comments?.length || 0}</span>
          </button>
          {showDelete && onDelete && (
            <button 
              className={`${buttonBaseClasses} hover:text-red-600 hover:bg-red-50`}
              onClick={(e) => onDelete(e, map.id)}
              title="Delete"
            >
              <span className="text-sm">🗑️</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}; 