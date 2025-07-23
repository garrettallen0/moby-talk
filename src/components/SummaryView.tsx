import { ChapterMap } from "../types/map";

interface SummaryViewProps {
  map: ChapterMap;
}

export function SummaryView({ map }: SummaryViewProps) {
  return (
    <div className="space-y-4">
      {map.shortDescription && (
        <div className="p-4 border rounded-lg">
          <h3 className="text-sm font-bold mb-2">Summary</h3>
          <div className="text-base leading-relaxed">
            {map.shortDescription}
          </div>
        </div>
      )}
      <div className="p-4 border rounded-lg">
        <h3 className="text-sm font-bold mb-2">Description</h3>
        <div className="text-base leading-relaxed">
          {map.description || "No summary available."}
        </div>
      </div>
    </div>
  );
} 