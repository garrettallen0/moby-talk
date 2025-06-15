import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChapterMap, ChapterAnnotation, Citation } from '../types/map';
import { useAuth } from '../contexts/AuthContext';
import { saveMap, getMapById, updateMap, deleteMap } from '../services/mapService';
import { AVAILABLE_THEMES } from '../constants/themes';
import { AnnotationModal } from './AnnotationModal';
import { ConfirmationModal } from './ConfirmationModal';
import { Timestamp } from 'firebase/firestore';
import '../styles/MapEditor.css';

const SPECIAL_CHAPTERS = {
  '-1': 'Extracts',
  '0': 'Etymology',
  '136': 'Epilogue',
} as const;

export function MapEditor() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const [map, setMap] = useState<ChapterMap | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState('');
  const [selectedChapters, setSelectedChapters] = useState<Set<number>>(new Set());
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
  const [showAnnotationModal, setShowAnnotationModal] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [showChapterSelection, setShowChapterSelection] = useState(false);
  const [chapterAnnotations, setChapterAnnotations] = useState<Record<number, ChapterAnnotation>>({});
  const [selectedCitation, setSelectedCitation] = useState<number | null>(null);

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

  const getChapterTitle = (chapter: number) => {
    return SPECIAL_CHAPTERS[String(chapter) as keyof typeof SPECIAL_CHAPTERS] || `Chapter ${chapter}`;
  };

  const handleSave = async () => {
    if (!user || !name.trim() || selectedChapters.size === 0) return;

    const updatedMap: ChapterMap = {
      ...(map || {}),
      id: map?.id || '',
      name: name.trim(),
      description,
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
    
    setChapterAnnotations(prev => ({
      ...prev,
      [selectedChapter]: {
        ...currentAnnotation,
        citations: [...currentAnnotation.citations, newCitation]
      }
    }));
    
    setSelectedCitation(currentAnnotation.citations.length);
  };

  const handleCitationChange = (citationIndex: number, passage: string) => {
    if (selectedChapter === null) return;
    
    const currentAnnotation = chapterAnnotations[selectedChapter];
    const updatedCitations = [...currentAnnotation.citations];
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
    setSelectedCitation(index);
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

  return (
    <div className="map-editor">
      <div className="editor-header">
        <button className="back-button" onClick={() => navigate('/')}>
          ← Back
        </button>
        <div className="header-content">
          <input
            type="text"
            placeholder="Map Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="name-input"
          />
        </div>
        <div className="editor-actions">
          <button
            className="save-button"
            onClick={handleSave}
            disabled={!name.trim() || selectedChapters.size === 0}
          >
            {id ? 'Save' : 'Create Map'}
          </button>
          <button className="cancel-button" onClick={() => navigate('/')}>
            Cancel
          </button>
          {id && (
            <button
              className="delete-button"
              onClick={() => setShowDeleteConfirmation(true)}
            >
              Delete
            </button>
          )}
        </div>
      </div>

      <div className="editor-content">
        <div className="map-navigation">
          <button 
            className={`nav-button summary-button ${selectedChapter === null ? 'active' : ''}`}
            onClick={handleSummaryClick}
          >
            Summary
          </button>
          <div className="nav-divider" />
          {Array.from(selectedChapters).sort((a, b) => a - b).map(chapter => (
            <button
              key={chapter}
              className={`nav-button ${selectedChapter === chapter ? 'active' : ''}`}
              onClick={() => handleChapterClick(chapter)}
            >
              {getChapterTitle(chapter)}
            </button>
          ))}
          <button 
            className="nav-button add-chapter-button"
            onClick={() => setShowChapterSelection(true)}
          >
            + Add Chapter
          </button>
        </div>

        <div className="map-content">
          {selectedChapter === null ? (
            <div className="map-summary">
              <textarea
                placeholder="Enter map description..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="summary-input"
              />
            </div>
          ) : (
            <div className="chapter-annotation">
              <textarea
                placeholder="Enter chapter annotation..."
                value={chapterAnnotations[selectedChapter]?.annotation || ''}
                onChange={(e) => handleAnnotationChange(e.target.value)}
                className="annotation-input"
              />
              
              {selectedCitation !== null && chapterAnnotations[selectedChapter]?.citations[selectedCitation] && (
                <div className="citation">
                  <textarea
                    placeholder="Enter citation..."
                    value={chapterAnnotations[selectedChapter].citations[selectedCitation].passage}
                    onChange={(e) => handleCitationChange(selectedCitation, e.target.value)}
                    className="citation-input"
                  />
                </div>
              )}

              <div className="citation-footer">
                <div className="citation-count">
                  <span>Citations</span>
                  <div className="citation-bubbles">
                    {Array.from({ length: chapterAnnotations[selectedChapter]?.citations.length || 0 }).map((_, index) => (
                      <div
                        key={index}
                        className={`citation-bubble ${index === selectedCitation ? 'active' : ''}`}
                        onClick={() => handleCitationClick(index)}
                      >
                        {index + 1}
                      </div>
                    ))}
                    <div
                      className="citation-bubble add-bubble"
                      onClick={handleAddCitation}
                    >
                      +
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="map-theme">
          <select
            className="theme-select"
            value={selectedTheme}
            onChange={(e) => setSelectedTheme(e.target.value)}
          >
            <option value="" disabled>Select a theme</option>
            {AVAILABLE_THEMES.map((theme) => (
              <option key={theme} value={theme}>
                {theme}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="editor-footer">
        <div className="map-metadata">
          <span className="map-date">
            {map ? (map.createdAt instanceof Timestamp 
              ? map.createdAt.toDate().toLocaleDateString()
              : new Date(map.createdAt).toLocaleDateString()
            ) : 'New Map'}
          </span>
          <span className="map-creator">{user?.displayName || 'Anonymous'}</span>
        </div>
        <div className="visibility-toggle">
            <label className="toggle-label">
              <span>{isPublic ? 'Public' : 'Private'}</span>
              <div
                className={`toggle-switch ${isPublic ? 'active' : ''}`}
                onClick={() => setIsPublic(!isPublic)}
              >
                <div className="toggle-slider" />
              </div>
            </label>
          </div>
        <div className="map-actions">
          <button className="action-button like-button">
            ↑ {map?.likes?.length || 0}
          </button>
          <button className="action-button comment-button">
            💬 {map?.comments?.length || 0}
          </button>
        </div>
      </div>

      {showChapterSelection && (
        <div className="chapter-selection-modal">
          <div className="modal-overlay" onClick={() => setShowChapterSelection(false)} />
          <div className="modal-content">
            <div className="modal-header">
              <h2>Select Chapters</h2>
              <button className="close-button" onClick={() => setShowChapterSelection(false)}>
                &times;
              </button>
            </div>
            <div className="modal-body">
              <div className="chapter-grid">
                {allChapters.map((chapter) => (
                  <button
                    key={chapter}
                    className={`chapter-button ${selectedChapters.has(chapter) ? 'selected-primary' : ''}`}
                    onClick={() => selectedChapters.has(chapter) 
                      ? handleRemoveChapter(chapter)
                      : handleAddChapter(chapter)
                    }
                    data-title={getChapterTitle(chapter)}
                  >
                    {chapter}
                  </button>
                ))}
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="save-button"
                onClick={() => setShowChapterSelection(false)}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {showAnnotationModal && selectedChapter !== null && (
        <AnnotationModal
          chapter={selectedChapter}
          chapterTitle={getChapterTitle(selectedChapter)}
          annotations={chapterAnnotations[selectedChapter] || []}
          onClose={() => setShowAnnotationModal(false)}
          onSave={(annotations) => {
            setChapterAnnotations((prev) => ({
              ...prev,
              [selectedChapter]: annotations,
            }));
            setShowAnnotationModal(false);
          }}
        />
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