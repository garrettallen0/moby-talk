import { ChapterMap } from "../types/map";

interface ChapterViewProps {
  map: ChapterMap;
  selectedChapter: number;
  selectedCitations: Set<number>;
  onCitationClick: (index: number) => void;
}

export function ChapterView({ 
  map, 
  selectedChapter, 
  selectedCitations, 
  onCitationClick 
}: ChapterViewProps) {
  return (
    <>
      <div className="max-w-4xl mx-auto flex flex-col flex-1 min-h-0 w-full">
        <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg mb-4 text-gray-900 text-base leading-relaxed">
          {map.chapterAnnotations?.[selectedChapter]?.annotation ||
            "No annotation available."}
        </div>

        {selectedCitations.size > 0 &&
          map.chapterAnnotations?.[selectedChapter]?.citations &&
          Array.from(selectedCitations)
            .sort((a, b) => a - b)
            .map((citationIndex) => {
              const citation = map.chapterAnnotations[selectedChapter].citations[citationIndex];
              return citation ? (
                <div key={citationIndex} className="p-4 bg-gray-50 border border-gray-200 rounded mb-4">
                  <div className="italic text-gray-600 leading-relaxed">
                    {citation.passage}
                  </div>
                </div>
              ) : null;
            })}
      </div>

      <div className="mt-auto pt-4 border-t border-gray-200">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Citations</span>
          <div className="flex gap-2">
            {Array.from({
              length:
                (map.chapterAnnotations?.[selectedChapter]?.citations || []).length,
            }).map((_, index) => (
              <div
                key={index}
                className={`w-6 h-6 border rounded-full flex items-center justify-center text-xs cursor-pointer transition-all duration-200 ${
                  selectedCitations.has(index)
                    ? "bg-blue-500 border-blue-500 text-white" 
                    : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50 hover:border-blue-500 hover:text-blue-500"
                }`}
                onClick={() => onCitationClick(index)}
              >
                {index + 1}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
} 