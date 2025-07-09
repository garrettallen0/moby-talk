import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ChapterMap } from "../types/map";
import { getPublicMaps, getUserMaps } from "../services/mapService";
import { useAuth } from "../contexts/AuthContext";
import { Timestamp } from "firebase/firestore";
import { ChapterNavigation } from "./ChapterNavigation";

export function MapDetail() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [map, setMap] = useState<ChapterMap | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
  const [selectedCitations, setSelectedCitations] = useState<Set<number>>(new Set());

  useEffect(() => {
    const mapId = location.state?.mapId;
    if (!mapId) {
      navigate("/");
      return;
    }

    const loadMap = async () => {
      try {
        // First try to find in public maps
        const publicMaps = await getPublicMaps();
        const foundMap = publicMaps.find((m) => m.id === mapId);

        if (foundMap) {
          setMap(foundMap);
          return;
        }

        // If not found in public maps and user is logged in, try user maps
        if (user) {
          const userMaps = await getUserMaps(user.uid);
          const userMap = userMaps.find((m) => m.id === mapId);
          if (userMap) {
            setMap(userMap);
          }
        }
      } catch (error) {
        console.error("Error loading map:", error);
      }
    };

    loadMap();
  }, [location.state?.mapId, user, navigate]);

  if (!map) {
    return (
      <div className="flex justify-center items-center min-h-48 text-xl text-gray-600">
        Loading...
      </div>
    );
  }

  const formatDate = (date: Date | Timestamp) => {
    if (date instanceof Timestamp) {
      return date.toDate().toLocaleDateString();
    }
    return date.toLocaleDateString();
  };

  const handleChapterClick = (chapter: number) => {
    setSelectedChapter(chapter);
  };

  const handleSummaryClick = () => {
    setSelectedChapter(null);
  };



  const handleBackClick = () => {
    navigate("/");
  };

  const handleEditClick = () => {
    navigate(`/map/${map.id}/edit`);
  };

  const isOwner = user && map.userId === user.uid;

  const handleCitationClick = (index: number) => {
    setSelectedCitations(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  return (
    <div className="max-w-6xl mx-auto p-8 md:p-4 flex flex-col gap-8 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
      <div className="border-b-2 border-gray-200 pb-4 flex relative items-center gap-4">
        <button 
          className="relative px-4 py-2 border border-gray-300 rounded bg-white cursor-pointer transition-all duration-200 text-sm text-gray-600 hover:bg-gray-50 hover:border-blue-500 hover:text-blue-500" 
          onClick={handleBackClick}
        >
          ← Back
        </button>
        <h1 className="absolute left-1/2 transform -translate-x-1/2 m-0 text-gray-800 text-3xl md:text-2xl font-medium">
          {map.name}
        </h1>
        {isOwner && (
          <button 
            className="absolute right-0 px-4 py-2 border border-blue-500 rounded bg-white text-blue-500 cursor-pointer transition-all duration-200 text-sm hover:bg-blue-500 hover:text-white" 
            onClick={handleEditClick}
          >
            Edit Map
          </button>
        )}
      </div>

      <ChapterNavigation
        selectedChapter={selectedChapter}
        chapters={map.selectedChapters}
        onChapterClick={handleChapterClick}
        onSummaryClick={handleSummaryClick}
        variant="detail"
      />

      <div className="flex-1 p-8 md:p-4 overflow-y-auto flex flex-col min-h-0 bg-white border border-gray-200 rounded-lg shadow-sm mx-4">
        {selectedChapter === null ? (
          <div className="text-gray-900 text-base leading-relaxed">
            {map.description || "No summary available."}
          </div>
        ) : (
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
                      onClick={() => handleCitationClick(index)}
                    >
                      {index + 1}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="inline-flex items-center gap-3 px-5 py-2 bg-purple-100 rounded-full shadow-sm w-fit self-center">
        <p className="m-0 text-purple-800 leading-relaxed text-base whitespace-nowrap">
          {map.theme || "No theme specified."}
        </p>
      </div>

      <div className="flex justify-between items-center pt-4 border-t border-gray-200">
        <div className="flex items-center gap-4">
          <span className="text-gray-600 text-sm">{formatDate(map.createdAt)}</span>
          <span className="text-gray-800 font-medium">{map.userName}</span>
        </div>
        <div className="flex gap-4">
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded bg-white cursor-pointer transition-all duration-200 text-base text-gray-600 hover:bg-gray-50 hover:border-blue-500 hover:text-blue-500">
            ↑ {map.likes?.length || 0}
          </button>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded bg-white cursor-pointer transition-all duration-200 text-base text-gray-600 hover:bg-gray-50 hover:border-blue-500 hover:text-blue-500">
            💬 {map.comments?.length || 0}
          </button>
        </div>
      </div>
    </div>
  );
}
