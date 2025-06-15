import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChapterMap, Annotation } from '../types/map';
import { useAuth } from '../contexts/AuthContext';
import { saveMap, getMapById, updateMap, deleteMap } from '../services/mapService';
import { AVAILABLE_THEMES } from '../constants/themes';
import { AnnotationModal } from './AnnotationModal';
import { ConfirmationModal } from './ConfirmationModal';
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
  const [chapterAnnotations, setChapterAnnotations] = useState<Record<number, Annotation[]>>({});

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
    if (selectedChapters.has(chapter)) {
      setSelectedChapter(chapter);
    } else {
      const newSelectedChapters = new Set(selectedChapters);
      newSelectedChapters.add(chapter);
      setSelectedChapters(newSelectedChapters);
    }
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
        // Editing existing map
        await updateMap(id, {
          name: updatedMap.name,
          description: updatedMap.description,
          isPublic: updatedMap.isPublic,
          selectedChapters: updatedMap.selectedChapters,
          theme: updatedMap.theme,
          chapterAnnotations: updatedMap.chapterAnnotations,
        });
      } else {
        // Creating new map
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

  const getChapterStyle = (chapter: number) => {
    return selectedChapters.has(chapter)
      ? 'chapter-button selected-primary'
      : 'chapter-button';
  };

  return (
    <div className="map-editor">
      <div className="editor-header">
        <button className="back-button" onClick={() => navigate('/')}>
          ← Back
        </button>
        <h1>{id ? 'Edit Map' : 'Create New Map'}</h1>
      </div>

      <div className="editor-content">
        <div className="editor-section">
          <input
            type="text"
            placeholder="Map Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="name-input"
          />
          <textarea
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="description-input"
          />
          <div className="theme-section">
            <label htmlFor="theme">Theme</label>
            <select
              id="theme"
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
        </div>

        <div className="chapter-section">
          <h3>Select Chapters</h3>
          <div className="chapter-grid">
            {allChapters.map((chapter) => (
              <button
                key={chapter}
                className={getChapterStyle(chapter)}
                onClick={() => handleChapterClick(chapter)}
                data-title={
                  SPECIAL_CHAPTERS[String(chapter) as keyof typeof SPECIAL_CHAPTERS]
                }
              >
                {chapter}
              </button>
            ))}
          </div>
        </div>

        {selectedChapter !== null && (
          <div className="selected-chapter-actions">
            <h3>{SPECIAL_CHAPTERS[String(selectedChapter) as keyof typeof SPECIAL_CHAPTERS] || `Chapter ${selectedChapter}`}</h3>
            <button 
              className="annotation-button"
              onClick={() => setShowAnnotationModal(true)}
            >
              {chapterAnnotations[selectedChapter]?.length 
                ? `Edit Annotations (${chapterAnnotations[selectedChapter].length})`
                : 'Add Annotations'}
            </button>
          </div>
        )}
      </div>

      <div className="editor-footer">
        <div className="action-buttons">
          <button
            className="save-button"
            onClick={handleSave}
            disabled={!name.trim() || selectedChapters.size === 0}
          >
            {id ? 'Save Changes' : 'Create Map'}
          </button>
          {id && (
            <button
              className="delete-button"
              onClick={() => setShowDeleteConfirmation(true)}
            >
              Delete
            </button>
          )}
          <button className="cancel-button" onClick={() => navigate('/')}>
            Cancel
          </button>
        </div>
      </div>

      {showAnnotationModal && selectedChapter !== null && (
        <AnnotationModal
          chapter={selectedChapter}
          chapterTitle={
            SPECIAL_CHAPTERS[String(selectedChapter) as keyof typeof SPECIAL_CHAPTERS] ||
            `Chapter ${selectedChapter}`
          }
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