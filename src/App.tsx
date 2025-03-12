import { useState } from 'react'
import './App.css'
import ForceGraph from './components/ForceGraph'
import { GraphData, Node, Link } from './types/graph'

// Special chapters with their IDs
const SPECIAL_CHAPTERS = {
  '-1': 'Extracts',
  '0': 'Etymology',
  '136': 'Epilogue'
} as const;

function App() {
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
  const [relatedChapters, setRelatedChapters] = useState<Set<number>>(new Set());
  const [relationships, setRelationships] = useState<Map<number, number[]>>(new Map());
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], links: [] });
  const [isEditing, setIsEditing] = useState(false);

  // Generate array of all chapters in sequence (-1, 0, 1-135, 136)
  const allChapters = [-1, 0, ...Array.from({ length: 135 }, (_, i) => i + 1), 136];

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

    setRelationships(prev => {
      const newMap = new Map(prev);
      newMap.set(selectedChapter, Array.from(relatedChapters));
      return newMap;
    });

    // Reset selections
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

  const generateGraph = () => {
    const nodes: Node[] = [];
    const links: Link[] = [];
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

    setGraphData({ nodes, links });
  };

  const getChapterStyle = (chapter: number) => {
    if (chapter === selectedChapter) return "chapter-button selected-primary";
    if (relatedChapters.has(chapter)) return "chapter-button selected-related";
    return "chapter-button";
  };

  return (
    <div className="container">
      <h1>Moby-Dick Chapter Relationships</h1>
      
      <div className="chapter-bank">
        <h3>Select Chapters</h3>
        <p className="instructions">
          First, click a chapter to select it (turns green), then click other chapters to mark them as related (turns blue).
          Click "Add Relationship" when done selecting related chapters.
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
            {isEditing ? 'Update Relationship' : 'Add Relationship'}
          </button>
          <button 
            className="visualize-button"
            onClick={generateGraph}
            disabled={relationships.size === 0}
          >
            Visualize
          </button>
        </div>

        <div className="chapter-legend">
          <h4>Chapter Legend:</h4>
          {Object.entries(SPECIAL_CHAPTERS).map(([id, name]) => (
            <div key={id} className="legend-item">
              {id} = {name}
            </div>
          ))}
        </div>
      </div>

      <div className="relationships-list">
        <h3>Current Relationships:</h3>
        <p className="instructions">Click on any relationship to edit it.</p>
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
  )
}

export default App
