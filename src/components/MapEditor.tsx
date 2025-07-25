import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChapterMap, ChapterAnnotation, Citation } from '../types/map';
import { useAuth } from '../contexts/AuthContext';
import { saveMap, getMapById, updateMap, deleteMap } from '../services/mapService';
import { AVAILABLE_THEMES, SPECIAL_CHAPTERS } from '../constants/themes';
import { ConfirmationModal } from './ConfirmationModal';
import { ChapterNavigation } from './ChapterNavigation';
import { ActionButtons } from './ActionButtons';
import { Timestamp } from 'firebase/firestore';

export function MapEditor() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const [map, setMap] = useState<ChapterMap | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState('');
  const [selectedChapters, setSelectedChapters] = useState<Set<number>>(new Set());
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [showChapterSelection, setShowChapterSelection] = useState(false);
  const [chapterAnnotations, setChapterAnnotations] = useState<Record<number, ChapterAnnotation>>({});
  const [selectedCitations, setSelectedCitations] = useState<Set<number>>(new Set());

  // Generate array of all chapters in sequence (-1, 0, 1-135, 136)
  const allChapters = [-1, 0, ...Array.from({ length: 135 }, (_, i) => i + 1), 136];

  useEffect(() => {
    const loadMap = async () => {
      if (id) {
        try {
          const loadedMap = await getMapById(id);
          if (loadedMap) {
            setMap(loadedMap);
            setName(loadedMap.name);
            setDescription(loadedMap.description || '');
            setShortDescription(loadedMap.shortDescription || '');
            setIsPublic(loadedMap.isPublic);
            setSelectedTheme(loadedMap.theme || '');
            setSelectedChapters(new Set(loadedMap.selectedChapters));
            setChapterAnnotations(loadedMap.chapterAnnotations || {});
          }
        } catch (error) {
          console.error('Error loading map:', error);
          navigate('/');
        }
      }
    };

    loadMap();
  }, [id, navigate]);

  const handleChapterClick = (chapter: number) => {
    setSelectedChapter(chapter);
  };

  const handleSummaryClick = () => {
    setSelectedChapter(null);
  };

  const handleAddChapter = (chapter: number) => {
    const newSelectedChapters = new Set(selectedChapters);
    newSelectedChapters.add(chapter);
    setSelectedChapters(newSelectedChapters);
  };

  const handleRemoveChapter = (chapter: number) => {
    const newSelectedChapters = new Set(selectedChapters);
    newSelectedChapters.delete(chapter);
    setSelectedChapters(newSelectedChapters);
    if (selectedChapter === chapter) {
      setSelectedChapter(null);
    }
  };

  const handleSave = async () => {
    if (!user || !name.trim() || selectedChapters.size === 0) return;

    const updatedMap: ChapterMap = {
      ...(map || {}),
      id: map?.id || '',
      name: name.trim(),
      description,
      shortDescription,
      userId: user.uid,
      userName: user.displayName || 'Anonymous',
      isPublic,
      selectedChapters: Array.from(selectedChapters),
      theme: selectedTheme,
      chapterAnnotations,
      createdAt: map?.createdAt || new Date(),
      updatedAt: new Date(),
    };

    try {
      if (id) {
        await updateMap(id, {
          name: updatedMap.name,
          description: updatedMap.description,
          shortDescription: updatedMap.shortDescription,
          isPublic: updatedMap.isPublic,
          selectedChapters: updatedMap.selectedChapters,
          theme: updatedMap.theme,
          chapterAnnotations: updatedMap.chapterAnnotations,
        });
      } else {
        await saveMap(
          user.uid,
          user.displayName || 'Anonymous',
          updatedMap.name,
          updatedMap.selectedChapters,
          updatedMap.description,
          updatedMap.shortDescription,
          updatedMap.isPublic,
          updatedMap.chapterAnnotations,
          updatedMap.theme
        );
      }
      navigate('/');
    } catch (error) {
      console.error('Error saving map:', error);
    }
  };

  const handleDelete = async () => {
    if (!map?.id) return;
    try {
      await deleteMap(map.id);
      navigate('/');
    } catch (error) {
      console.error('Error deleting map:', error);
    }
  };

  const handleAddCitation = () => {
    if (selectedChapter === null) return;
    
    const currentAnnotation = chapterAnnotations[selectedChapter] || { annotation: '', citations: [] };
    const newCitation: Citation = { passage: '' };
    const currentCitations = currentAnnotation.citations || [];
    
    setChapterAnnotations(prev => ({
      ...prev,
      [selectedChapter]: {
        ...currentAnnotation,
        citations: [...currentCitations, newCitation]
      }
    }));
    
    setSelectedCitations(prev => new Set([...prev, currentCitations.length]));
  };

  const handleCitationChange = (citationIndex: number, passage: string) => {
    if (selectedChapter === null) return;
    
    const currentAnnotation = chapterAnnotations[selectedChapter] || { annotation: '', citations: [] };
    const updatedCitations = [...(currentAnnotation.citations || [])];
    updatedCitations[citationIndex] = { ...updatedCitations[citationIndex], passage };
    
    setChapterAnnotations(prev => ({
      ...prev,
      [selectedChapter]: {
        ...currentAnnotation,
        citations: updatedCitations
      }
    }));
  };

  const handleCitationClick = (index: number) => {
    if (selectedChapter === null) return;
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

  const handleAnnotationChange = (annotation: string) => {
    if (selectedChapter === null) return;
    
    setChapterAnnotations(prev => ({
      ...prev,
      [selectedChapter]: {
        ...prev[selectedChapter],
        annotation
      }
    }));
  };

  const handleDeleteCitation = (citationIndex: number) => {
    if (selectedChapter === null) return;
    
    // Update local state to reflect the deletion
    setChapterAnnotations(prev => {
      const currentAnnotation = prev[selectedChapter];
      if (!currentAnnotation) return prev;
      
      const updatedCitations = currentAnnotation.citations?.filter((_, index) => index !== citationIndex) || [];
      
      // If no citations remain and no annotation, remove the chapter entry
      if (updatedCitations.length === 0 && !currentAnnotation.annotation) {
        const rest = { ...prev };
        delete rest[selectedChapter];
        return rest;
      }
      
      return {
        ...prev,
        [selectedChapter]: {
          ...currentAnnotation,
          citations: updatedCitations
        }
      };
    });
    
    // Remove from selected citations if it was selected
    setSelectedCitations(prev => {
      const newSet = new Set(prev);
      newSet.delete(citationIndex);
      return newSet;
    });
  };

  return (
    <div className="flex flex-col bg-white border border-gray-200 rounded-xl shadow-lg mx-auto overflow-hidden max-w-6xl">
      {/* Header - Mobile optimized */}
      <div className="flex flex-col md:flex-row md:justify-between items-start md:items-center p-4 bg-white border-b border-gray-200 gap-4">
        {/* Back button and title - Mobile: stacked, Desktop: inline */}
        <div className="flex items-center gap-4 w-full md:w-auto">
          <button 
            className="px-4 py-2 border border-gray-300 rounded bg-white cursor-pointer transition-all duration-200 text-sm text-gray-600 hover:bg-gray-50 hover:border-blue-500 hover:text-blue-500" 
            onClick={() => navigate('/')}
          >
            ← Back
          </button>
          <input
            type="text"
            placeholder="Map Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 md:flex-none p-2 text-xl md:text-2xl border-none bg-transparent text-gray-900 font-medium focus:outline-none placeholder-gray-500"
          />
        </div>
        
        {/* Action buttons - Desktop only in header */}
        <div className="hidden md:block">
          <ActionButtons
            id={id}
            name={name}
            selectedChapters={selectedChapters}
            onSave={handleSave}
            onCancel={() => navigate('/')}
            onDelete={() => setShowDeleteConfirmation(true)}
            variant="header"
          />
        </div>
      </div>

      <div className="flex flex-col flex-1 min-h-0 gap-8">
        <ChapterNavigation
          selectedChapter={selectedChapter}
          chapters={Array.from(selectedChapters)}
          onChapterClick={handleChapterClick}
          onSummaryClick={handleSummaryClick}
          variant="editor"
          onAddChapter={() => setShowChapterSelection(true)}
        />

        <div className="flex-1 p-4">
          {selectedChapter === null ? (
            <div className="max-w-4xl mx-auto space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium text-gray-700">Summary</label>
                  <span className={`text-xs ${shortDescription.length > 160 ? 'text-red-500' : 'text-gray-500'}`}>
                    {shortDescription.length}/160
                  </span>
                </div>
                <textarea
                  placeholder="Summary..."
                  value={shortDescription}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value.length <= 160) {
                      setShortDescription(value);
                    }
                  }}
                  className={`w-full min-h-20 p-4 border rounded bg-white text-gray-900 text-base leading-relaxed resize-y focus:outline-none focus:ring-2 focus:ring-blue-200 ${
                    shortDescription.length > 160 ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
                  }`}
                />
              </div>
              <div>
                <textarea
                  placeholder="Description..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full min-h-48 p-4 border border-gray-300 rounded bg-white text-gray-900 text-base leading-relaxed resize-y focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto flex flex-col gap-4">
              <textarea
                placeholder="Enter chapter annotation..."
                value={chapterAnnotations[selectedChapter]?.annotation || ''}
                onChange={(e) => handleAnnotationChange(e.target.value)}
                className="w-full min-h-24 p-4 border border-gray-300 rounded bg-white text-gray-900 text-base leading-relaxed resize-y focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                required
              />
              
              {selectedCitations.size > 0 && chapterAnnotations[selectedChapter]?.citations &&
                Array.from(selectedCitations)
                  .sort((a, b) => a - b)
                  .map((citationIndex) => {
                    const citation = chapterAnnotations[selectedChapter].citations[citationIndex];
                    return citation ? (
                      <div key={citationIndex} className="p-4 bg-gray-50 border border-gray-200 rounded relative">
                        <button
                          onClick={() => handleDeleteCitation(citationIndex)}
                          className="absolute top-2 right-2 p-1 text-gray-600 hover:text-red-500 transition-colors duration-200"
                          title="Delete citation"
                        >
                          🗑️
                        </button>
                        <textarea
                          placeholder="Enter citation..."
                          value={citation.passage}
                          onChange={(e) => handleCitationChange(citationIndex, e.target.value)}
                          className="w-full min-h-24 p-2 pr-8 border-none bg-transparent text-gray-900 text-base leading-relaxed resize-y focus:outline-none placeholder-gray-500"
                        />
                      </div>
                    ) : null;
                  })}

              <div className="mt-auto pt-4 border-t border-gray-200">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Citations</span>
                  <div className="flex gap-2">
                    {Array.from({ length: (chapterAnnotations[selectedChapter]?.citations || []).length }).map((_, index) => (
                      <div
                        key={index}
                        className={`w-6 h-6 border rounded-full flex items-center justify-center text-xs cursor-pointer transition-all duration-200 ${
                          selectedCitations.has(index)
                            ? 'bg-blue-500 border-blue-500 text-white' 
                            : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50 hover:border-blue-500 hover:text-blue-500'
                        }`}
                        onClick={() => handleCitationClick(index)}
                      >
                        {index + 1}
                      </div>
                    ))}
                    <div
                      className="w-6 h-6 border border-gray-300 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 bg-white hover:bg-gray-50 hover:border-blue-500 hover:text-blue-500"
                      onClick={handleAddCitation}
                    >
                      <svg width="12" height="12" viewBox="0 0 12 12" stroke="currentColor" strokeWidth="2" fill="none" className="text-gray-600">
                        <line x1="6" y1="2" x2="6" y2="10"/>
                        <line x1="2" y1="6" x2="10" y2="6"/>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-center p-4 border-t border-gray-200">
          <div className="inline-flex items-center gap-3 px-5 py-2 bg-purple-100 rounded-full shadow-sm w-fit self-center">
            <select
              className="bg-transparent border-none text-purple-800 text-base cursor-pointer font-medium focus:outline-none"
              value={selectedTheme}
              onChange={(e) => setSelectedTheme(e.target.value)}
            >
              <option value="" disabled>Select a theme</option>
              {AVAILABLE_THEMES.map((theme) => (
                <option key={theme} value={theme} className="bg-white text-purple-800">
                  {theme}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Mobile action buttons - bottom */}
      <div className="md:hidden">
        <ActionButtons
          id={id}
          name={name}
          selectedChapters={selectedChapters}
          onSave={handleSave}
          onCancel={() => navigate('/')}
          onDelete={() => setShowDeleteConfirmation(true)}
          variant="bottom"
        />
      </div>

      <div className="flex justify-between items-center p-4 bg-white border-t border-gray-200">
        <div className="flex gap-4 text-gray-500 text-sm">
          <span className="text-gray-500">
            {map ? (map.createdAt instanceof Timestamp 
              ? map.createdAt.toDate().toLocaleDateString()
              : new Date(map.createdAt).toLocaleDateString()
            ) : 'New Map'}
          </span>
          <span className="text-gray-500">{user?.displayName || 'Anonymous'}</span>
        </div>
        <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">{isPublic ? 'Public' : 'Private'}</span>
            <div
              className={`relative w-9 h-5 rounded-full cursor-pointer transition-all duration-200 ${
                isPublic ? 'bg-blue-500' : 'bg-gray-300'
              }`}
              onClick={() => setIsPublic(!isPublic)}
            >
              <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all duration-200 ${
                isPublic ? 'left-4' : 'left-0.5'
              }`} />
            </div>
          </div>
        <div className="flex items-center gap-4">
          <div className="flex gap-2">
            <button className="bg-transparent border-none text-gray-500 cursor-pointer p-2 text-base flex items-center gap-1 hover:text-blue-500">
              ↑ {map?.likes?.length || 0}
            </button>
            <button className="bg-transparent border-none text-gray-500 cursor-pointer p-2 text-base flex items-center gap-1 hover:text-blue-500">
              💬 {map?.comments?.length || 0}
            </button>
          </div>
        </div>
      </div>

      {showChapterSelection && (
        <div className="fixed inset-0 z-50 flex justify-center items-center">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowChapterSelection(false)} />
          <div className="relative bg-white rounded-lg p-8 w-11/12 max-w-4xl max-h-[90vh] overflow-y-auto shadow-lg">
            <div className="flex justify-between items-center mb-6">
              <h2 className="m-0 text-gray-800 text-2xl font-medium">Select Chapters</h2>
              <button 
                className="bg-transparent border-none text-2xl text-gray-600 cursor-pointer p-2 hover:text-gray-800" 
                onClick={() => setShowChapterSelection(false)}
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
                      ? handleRemoveChapter(chapter)
                      : handleAddChapter(chapter)
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
                onClick={() => setShowChapterSelection(false)}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirmation && (
        <ConfirmationModal
          message="Are you sure you want to delete this map?"
          confirmText="Yes, delete"
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteConfirmation(false)}
        />
      )}
    </div>
  );
} 