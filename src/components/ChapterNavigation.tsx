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
    ? 'px-6 py-3 text-lg font-medium' 
    : 'px-4 py-2 text-sm whitespace-nowrap';

  return (
    <div className="flex items-center gap-4 p-4 border-b border-gray-200">
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
      <div className="w-px h-6 bg-gray-300"></div>
      <div className="flex flex-wrap items-center gap-2 flex-1">
        {chapters
          .sort((a, b) => a - b)
          .map((chapter) => (
            <button
              key={chapter}
              className={`px-4 py-2 rounded cursor-pointer transition-all duration-200 text-sm whitespace-nowrap ${
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
      {variant === 'editor' && onAddChapter && (
        <button 
          className="px-4 py-2 border border-blue-500 rounded bg-white cursor-pointer transition-all duration-200 text-sm text-blue-500 hover:bg-blue-500 hover:text-white whitespace-nowrap"
          onClick={onAddChapter}
        >
          + Add Chapter
        </button>
      )}
    </div>
  );
} 