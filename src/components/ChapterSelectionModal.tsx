import { SPECIAL_CHAPTERS } from '../constants/themes';

interface ChapterSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedChapters: Set<number>;
  onAddChapter: (chapter: number) => void;
  onRemoveChapter: (chapter: number) => void;
  allChapters?: number[];
}

export function ChapterSelectionModal({
  isOpen,
  onClose,
  selectedChapters,
  onAddChapter,
  onRemoveChapter,
  allChapters = [-1, 0, ...Array.from({ length: 135 }, (_, i) => i + 1), 136],
}: ChapterSelectionModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-center">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="relative bg-white rounded-lg p-8 w-11/12 max-w-4xl max-h-[90vh] overflow-y-auto shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="m-0 text-gray-800 text-2xl font-medium">Select Chapters</h2>
          <button 
            className="bg-transparent border-none text-2xl text-gray-600 cursor-pointer p-2 hover:text-gray-800" 
            onClick={onClose}
          >
            &times;
          </button>
        </div>
        <div className="mb-6">
          <div className="grid grid-cols-8 md:grid-cols-12 lg:grid-cols-16 gap-2 mt-4">
            {allChapters.map((chapter) => (
              <button
                key={chapter}
                className={`p-2 rounded cursor-pointer transition-all duration-200 text-sm text-center relative ${
                  selectedChapters.has(chapter) 
                    ? 'bg-blue-500 text-white border border-blue-500 hover:bg-blue-600 hover:border-blue-600' 
                    : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50 hover:border-blue-500 hover:text-blue-500'
                }`}
                onClick={() => selectedChapters.has(chapter) 
                  ? onRemoveChapter(chapter)
                  : onAddChapter(chapter)
                }
                data-title={SPECIAL_CHAPTERS[String(chapter) as keyof typeof SPECIAL_CHAPTERS] || `Chapter ${chapter}`}
              >
                {chapter}
              </button>
            ))}
          </div>
        </div>
        <div className="flex justify-end gap-4">
          <button 
            className="px-4 py-2 bg-blue-500 text-white border-none rounded text-sm cursor-pointer transition-all duration-200 font-medium hover:bg-blue-600"
            onClick={onClose}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
} 