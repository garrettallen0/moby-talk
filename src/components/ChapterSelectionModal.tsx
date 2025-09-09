import { SPECIAL_CHAPTERS } from '../constants/themes';
import { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { lockScroll, unlockScroll } from '../utils/scrollLock';

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
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'selected'>('all');

  // Close modal on escape key and disable body scroll when modal is open
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      lockScroll();
    } else {
      unlockScroll();
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      unlockScroll();
    };
  }, [isOpen, onClose]);



  // Filter chapters based on search and active tab
  const filteredChapters = useMemo(() => {
    let chapters = allChapters;
    
    if (activeTab === 'selected') {
      chapters = allChapters.filter(chapter => selectedChapters.has(chapter));
    }
    
    if (searchTerm) {
      const searchNum = parseInt(searchTerm);
      if (!isNaN(searchNum)) {
        chapters = chapters.filter(chapter => chapter.toString().includes(searchTerm));
      } else {
        chapters = chapters.filter(chapter => {
          const chapterName = SPECIAL_CHAPTERS[String(chapter) as keyof typeof SPECIAL_CHAPTERS] || `Chapter ${chapter}`;
          return chapterName.toLowerCase().includes(searchTerm.toLowerCase());
        });
      }
    }
    
    return chapters;
  }, [allChapters, selectedChapters, searchTerm, activeTab]);



  const getChapterDisplayName = (chapter: number) => {
    return SPECIAL_CHAPTERS[String(chapter) as keyof typeof SPECIAL_CHAPTERS] || `Chapter ${chapter}`;
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex justify-center items-center">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="relative bg-white rounded-lg p-4 md:p-8 w-11/12 max-w-4xl max-h-[80vh] overflow-hidden shadow-lg flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="m-0 text-gray-800 text-xl md:text-2xl font-medium">Select Chapters</h2>
          <button 
            className="bg-transparent border-none text-2xl text-gray-600 cursor-pointer p-2 hover:text-gray-800" 
            onClick={onClose}
          >
            &times;
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search chapters..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Tabs */}
        <div className="flex mb-4 border-b border-gray-200">
          <button
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'all' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('all')}
          >
            All ({allChapters.length})
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'selected' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('selected')}
          >
            Selected ({selectedChapters.size})
          </button>
        </div>



        {/* Chapter Grid - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          {filteredChapters.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              {searchTerm ? 'No chapters found matching your search.' : 'No chapters available.'}
            </div>
          ) : (
            <div className="grid grid-cols-5 md:grid-cols-10 lg:grid-cols-15 gap-1">
              {filteredChapters.map((chapter) => (
                <button
                  key={chapter}
                  className={`p-2 md:p-1 rounded cursor-pointer transition-all duration-200 text-xs text-center relative min-h-[36px] flex items-center justify-center ${
                    selectedChapters.has(chapter) 
                      ? 'bg-blue-500 text-white border border-blue-500 hover:bg-blue-600 hover:border-blue-600' 
                      : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50 hover:border-blue-500 hover:text-blue-500'
                  }`}
                  onClick={() => selectedChapters.has(chapter) 
                    ? onRemoveChapter(chapter)
                    : onAddChapter(chapter)
                  }
                  title={getChapterDisplayName(chapter)}
                >
                  <span className="truncate">{chapter}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            {selectedChapters.size} chapter{selectedChapters.size !== 1 ? 's' : ''} selected
          </div>
          <button 
            className="px-4 py-2 bg-blue-500 text-white border-none rounded text-sm cursor-pointer transition-all duration-200 font-medium hover:bg-blue-600"
            onClick={onClose}
          >
            Done
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
} 