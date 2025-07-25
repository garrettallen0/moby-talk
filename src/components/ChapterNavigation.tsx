import { SPECIAL_CHAPTERS } from '../constants/themes';

interface ChapterNavigationProps {
  selectedChapter: number | null;
  chapters: number[];
  onChapterClick: (chapter: number) => void;
  onSummaryClick: () => void;
  variant?: 'detail' | 'editor';
  onAddChapter?: () => void;
}

export function ChapterNavigation({
  selectedChapter,
  chapters,
  onChapterClick,
  onSummaryClick,
  variant = 'detail',
  onAddChapter,
}: ChapterNavigationProps) {
  const getChapterTitle = (chapter: number) => {
    return (
      SPECIAL_CHAPTERS[String(chapter) as keyof typeof SPECIAL_CHAPTERS] ||
      `Chapter ${chapter}`
    );
  };

  const isDetail = variant === 'detail';
  const summaryButtonClasses = isDetail 
    ? 'px-4 md:px-6 py-2 md:py-3 text-base md:text-lg font-medium' 
    : 'px-3 md:px-4 py-2 text-sm whitespace-nowrap';

  return (
    <div className="flex flex-col md:flex-row items-start md:items-center gap-3 md:gap-4 p-3 md:p-4 border-b border-gray-200">
      {/* Summary button and divider - Mobile: full width, Desktop: inline */}
      <div className="flex justify-center items-center gap-3 md:gap-4 w-full md:w-auto">
        <button
          className={`rounded cursor-pointer transition-all duration-200 ${summaryButtonClasses} ${
            selectedChapter === null 
              ? 'bg-blue-500 text-white border border-blue-500 hover:bg-blue-600 hover:border-blue-600' 
              : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50 hover:border-blue-500 hover:text-blue-500'
          }`}
          onClick={onSummaryClick}
        >
          Summary
        </button>
      </div>

      <div className="h-px w-full md:h-6 md:w-px bg-gray-300"></div>
      
      <div className="flex justify-center md:justify-start items-center gap-2 flex-1 w-full md:w-auto flex-wrap">
        {chapters
          .sort((a, b) => a - b)
          .map((chapter) => (
            <button
              key={chapter}
              className={`px-3 md:px-4 py-2 rounded cursor-pointer transition-all duration-200 text-sm whitespace-nowrap ${
                selectedChapter === chapter 
                  ? 'bg-blue-500 text-white border border-blue-500 hover:bg-blue-600 hover:border-blue-600' 
                  : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50 hover:border-blue-500 hover:text-blue-500'
              }`}
              onClick={() => onChapterClick(chapter)}
            >
              {getChapterTitle(chapter)}
            </button>
          ))}
      </div>
      
      {/* Add Chapter button - Mobile: full width, Desktop: inline */}
      {variant === 'editor' && onAddChapter && (
        <button 
          className="px-3 md:px-4 py-2 border border-blue-500 rounded bg-white cursor-pointer transition-all duration-200 text-sm text-blue-500 hover:bg-blue-500 hover:text-white whitespace-nowrap w-full md:w-auto"
          onClick={onAddChapter}
        >
          + Add Chapter
        </button>
      )}
    </div>
  );
} 