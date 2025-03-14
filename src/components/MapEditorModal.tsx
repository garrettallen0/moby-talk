import { useState } from 'react';
import { ChapterMap } from '../types/map';
import ForceGraph from './ForceGraph';
import { GraphData } from '../types/graph';

interface MapEditorModalProps {
  map: ChapterMap;
  onClose: () => void;
  onSave: (map: ChapterMap) => void;
  onDelete: (mapId: string) => void;
  isPublicView?: boolean;
}

const SPECIAL_CHAPTERS = {
  '-1': 'Extracts',
  '0': 'Etymology',
  '136': 'Epilogue'
} as const;

export const MapEditorModal = ({ map, onClose, onSave, onDelete, isPublicView = false }: MapEditorModalProps) => {
  const [name, setName] = useState(map.name);
  const [description, setDescription] = useState(map.description || '');
  const [isPublic, setIsPublic] = useState(map.isPublic);
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
  const [relatedChapters, setRelatedChapters] = useState<Set<number>>(new Set());
  const [relationships, setRelationships] = useState<Map<number, number[]>>(
    new Map(map.relationships.map(rel => [rel.sourceChapter, rel.relatedChapters]))
  );
  const [isEditing, setIsEditing] = useState(false);
  const [isRelationshipsOpen, setIsRelationshipsOpen] = useState(true);
  const [graphData, setGraphData] = useState<GraphData>(convertToGraphData(relationships));

  // Generate array of all chapters in sequence (-1, 0, 1-135, 136)
  const allChapters = [-1, 0, ...Array.from({ length: 135 }, (_, i) => i + 1), 136];

  function convertToGraphData(relationships: Map<number, number[]>): GraphData {
    const nodes: any[] = [];
    const links: any[] = [];
    const connectionsCount = new Map<number, number>();

    // Count connections for each chapter
    relationships.forEach((related, chapter) => {
      connectionsCount.set(chapter, (connectionsCount.get(chapter) || 0) + related.length);
      related.forEach(r => {
        connectionsCount.set(r, (connectionsCount.get(r) || 0) + 1);
      });
    });

    // Create nodes
    Array.from(connectionsCount.keys()).forEach(chapter => {
      nodes.push({
        id: chapter,
        chapter: chapter,
        connections: connectionsCount.get(chapter) || 0
      });
    });

    // Create links
    relationships.forEach((related, chapter) => {
      related.forEach(r => {
        links.push({
          source: chapter,
          target: r
        });
      });
    });

    return { nodes, links };
  }

  const handleChapterClick = (chapter: number) => {
    if (selectedChapter === null) {
      // First selection
      setSelectedChapter(chapter);
      setRelatedChapters(new Set());
    } else if (chapter === selectedChapter) {
      // Deselect primary chapter
      setSelectedChapter(null);
      setRelatedChapters(new Set());
    } else {
      // Toggle related chapter
      const newRelated = new Set(relatedChapters);
      if (newRelated.has(chapter)) {
        newRelated.delete(chapter);
      } else {
        newRelated.add(chapter);
      }
      setRelatedChapters(newRelated);
    }
  };

  const handleAddRelationship = () => {
    if (selectedChapter === null) return;

    // Update relationships Map
    const newRelationships = new Map(relationships);
    newRelationships.set(selectedChapter, Array.from(relatedChapters));
    setRelationships(newRelationships);

    // Update graph data
    setGraphData(convertToGraphData(newRelationships));

    // Reset selection state
    setSelectedChapter(null);
    setRelatedChapters(new Set());
    setIsEditing(false);
  };

  const handleEditRelationship = (chapter: number) => {
    const related = relationships.get(chapter);
    if (related) {
      setSelectedChapter(chapter);
      setRelatedChapters(new Set(related));
      setIsEditing(true);
    }
  };

  const handleSave = () => {
    if (!name.trim()) return;
    
    const updatedMap: ChapterMap = {
      ...map,
      name: name.trim(),
      description,
      userId: map.userId,
      isPublic,
      relationships: Array.from(relationships.entries()).map(([sourceChapter, relatedChapters]) => ({
        sourceChapter,
        relatedChapters
      })),
      createdAt: map.createdAt,
      updatedAt: new Date(),
      id: map.id
    };
    onSave(updatedMap);
    onClose();
  };

  const getChapterStyle = (chapter: number) => {
    if (chapter === selectedChapter) return "chapter-button selected-primary";
    if (relatedChapters.has(chapter)) return "chapter-button selected-related";
    return "chapter-button";
  };

  return (
    <div className="map-editor-modal">
      <div className="modal-overlay" onClick={onClose} />
      <div className="modal-content">
        <div className="modal-header">
          <h2>{map.id ? map.name : 'Create New Map'}</h2>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>

        <div className="modal-body">
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

            <div className="visibility-toggle">
              <label className="toggle-label">
                <span>Make this map public</span>
                <div
                  className={`toggle-switch ${isPublic ? 'active' : ''}`}
                  onClick={() => setIsPublic(!isPublic)}
                >
                  <div className="toggle-slider" />
                </div>
              </label>
              <p className="visibility-hint">
                {isPublic ? 'Anyone can view this map' : 'Only you can view this map'}
              </p>
            </div>
          </div>

          <div className="chapter-bank">
            <h3>Select Chapters</h3>
            <p className="instructions">
              Click a chapter to select it. Then click other chapters to mark them as related. Then click "Add".
              {isEditing && " You are currently editing an existing relationship."}
            </p>

            <div className="chapter-grid">
              {allChapters.map(chapter => (
                <button
                  key={chapter}
                  className={getChapterStyle(chapter)}
                  onClick={() => handleChapterClick(chapter)}
                  data-title={SPECIAL_CHAPTERS[String(chapter) as keyof typeof SPECIAL_CHAPTERS]}
                >
                  {chapter}
                </button>
              ))}
            </div>

            <div className="action-buttons">
              <button 
                className="add-button"
                onClick={handleAddRelationship}
                disabled={!selectedChapter}
              >
                {isEditing ? 'Update' : 'Add'}
              </button>
            </div>
          </div>

          <div className="relationships-list">
            <button 
              className="relationships-header"
              onClick={() => setIsRelationshipsOpen(!isRelationshipsOpen)}
            >
              <div className={`toggle-pill ${isRelationshipsOpen ? 'active' : ''}`} />
              <h3>Show Relationships</h3>
            </button>
            
            <div className={`relationships-content ${isRelationshipsOpen ? '' : 'closed'}`}>
              <p className="instructions">Click a relationship to edit it.</p>
              {Array.from(relationships.entries()).map(([chapter, related]) => (
                <div 
                  key={chapter} 
                  className={`relationship-item ${selectedChapter === chapter ? 'editing' : ''}`}
                  onClick={() => handleEditRelationship(chapter)}
                >
                  Chapter {chapter} → Chapters {related.join(', ')}
                </div>
              ))}
            </div>
          </div>

          <div className="graph-container">
            {graphData.nodes.length > 0 && (
              <ForceGraph
                data={graphData}
                width={800}
                height={600}
              />
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button className="save-button" onClick={handleSave}>
            Save Changes
          </button>
          <button className="delete-button" onClick={() => onDelete(map.id)}>
            Delete Map
          </button>
          <button className="cancel-button" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}; 