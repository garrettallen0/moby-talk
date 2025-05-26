import { useState } from 'react';
import { ChapterMap } from '../types/map';
import { ConfirmationModal } from './ConfirmationModal';
import { AnnotationModal } from './AnnotationModal';
import { updateChapterAnnotations } from '../services/mapService';

interface MapEditorModalProps {
  map: ChapterMap;
  onClose: () => void;
  onSave: (map: ChapterMap) => void;
  onDelete: (mapId: string) => void;
}

const SPECIAL_CHAPTERS = {
  '-1': 'Extracts',
  '0': 'Etymology',
  '136': 'Epilogue',
} as const;

interface Annotation {
  passage: string;
  commentary: string;
}

interface ChapterAnnotations {
  [key: number]: Annotation[];
}

export const MapEditorModal = ({
  map,
  onClose,
  onSave,
  onDelete,
}: MapEditorModalProps) => {
  const [name, setName] = useState(map.name);
  const [description, setDescription] = useState(map.description || '');
  const [isPublic, setIsPublic] = useState(map.isPublic);
  const [selectedChapters, setSelectedChapters] = useState<Set<number>>(
    new Set(map.selectedChapters),
  );
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
  const [chapterAnnotations, setChapterAnnotations] =
    useState<ChapterAnnotations>(map.chapterAnnotations || {});

  // Generate array of all chapters in sequence (-1, 0, 1-135, 136)
  const allChapters = [
    -1,
    0,
    ...Array.from({ length: 135 }, (_, i) => i + 1),
    136,
  ];

  const handleChapterClick = (chapter: number) => {
    if (selectedChapters.has(chapter)) {
      setSelectedChapter(chapter);
    } else {
      const newSelectedChapters = new Set(selectedChapters);
      newSelectedChapters.add(chapter);
      setSelectedChapters(newSelectedChapters);
    }
  };

  const handleAnnotationSave = async (
    chapter: number,
    annotations: Annotation[],
  ) => {
    if (!map.id) {
      // If it's a new unsaved map, just update local state
      setChapterAnnotations((prev) => ({
        ...prev,
        [chapter]: annotations,
      }));
      setSelectedChapter(null);
      return;
    }

    try {
      await updateChapterAnnotations(map.id, chapter, annotations);
      setChapterAnnotations((prev) => ({
        ...prev,
        [chapter]: annotations,
      }));
      setSelectedChapter(null);
    } catch (error) {
      console.error('Error saving annotations:', error);
    }
  };

  const handleSave = () => {
    if (!name.trim() || selectedChapters.size === 0) return;

    const updatedMap: ChapterMap = {
      ...map,
      name: name.trim(),
      description,
      userId: map.userId,
      isPublic,
      selectedChapters: Array.from(selectedChapters),
      chapterAnnotations,
      createdAt: map.createdAt,
      updatedAt: new Date(),
      id: map.id,
    };
    onSave(updatedMap);
    onClose();
  };

  const getChapterStyle = (chapter: number) => {
    return selectedChapters.has(chapter)
      ? 'chapter-button selected-primary'
      : 'chapter-button';
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirmation(true);
  };

  const handleConfirmDelete = () => {
    onDelete(map.id);
    onClose();
  };

  return (
    <div className="map-editor-modal">
      <div className="modal-overlay" onClick={onClose} />
      <div className="modal-content">
        <div className="modal-header">
          <input
            type="text"
            placeholder="Map Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="name-input"
          />
          <button className="close-button" onClick={onClose}>
            &times;
          </button>
        </div>

        <div className="modal-body">
          <div className="editor-section">
            <textarea
              placeholder="Description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="description-input"
            />
            <div className="controls-row">
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
              <div className="action-buttons">
                <button className="save-button" onClick={handleSave}>
                  {map.id ? 'Save Changes' : 'Save'}
                </button>
                {map.id && <button className="delete-button" onClick={handleDeleteClick}>
                  Delete
                </button>}
                <button className="cancel-button" onClick={onClose}>
                  Cancel
                </button>
              </div>
            </div>
          </div>

          <div className="selected-chapters-summary">
            <h3>Selected Chapters</h3>
            <div className="selected-chapters-list">
              {Array.from(selectedChapters).length > 0 ? (
                <div className="chapter-grid">
                  {Array.from(selectedChapters)
                    .sort((a, b) => a - b)
                    .map((chapter) => (
                      <button
                        key={chapter}
                        className="chapter-button selected-primary"
                        onClick={() => handleChapterClick(chapter)}
                        data-title={
                          SPECIAL_CHAPTERS[
                            String(chapter) as keyof typeof SPECIAL_CHAPTERS
                          ]
                        }
                      >
                        {chapter}
                      </button>
                    ))}
                </div>
              ) : (
                <p>No chapters selected</p>
              )}
            </div>
          </div>

          <div className="chapter-bank">
            <h3>Select Chapters</h3>
            <p className="instructions">
              Click a chapter to add or remove it from your theme map.
            </p>

            <div className="chapter-grid">
              {allChapters.map((chapter) => (
                <button
                  key={chapter}
                  className={getChapterStyle(chapter)}
                  onClick={() => handleChapterClick(chapter)}
                  data-title={
                    SPECIAL_CHAPTERS[
                      String(chapter) as keyof typeof SPECIAL_CHAPTERS
                    ]
                  }
                >
                  {chapter}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {showDeleteConfirmation && (
        <ConfirmationModal
          message="Are you sure you want to delete this map?"
          confirmText="Yes, delete"
          onConfirm={handleConfirmDelete}
          onCancel={() => setShowDeleteConfirmation(false)}
        />
      )}

      {selectedChapter !== null && (
        <AnnotationModal
          chapter={selectedChapter}
          chapterTitle={
            SPECIAL_CHAPTERS[
              String(selectedChapter) as keyof typeof SPECIAL_CHAPTERS
            ] || `Chapter ${selectedChapter}`
          }
          annotations={chapterAnnotations[selectedChapter] || []}
          onClose={() => setSelectedChapter(null)}
          onSave={(annotations) =>
            handleAnnotationSave(selectedChapter, annotations)
          }
        />
      )}
    </div>
  );
};
