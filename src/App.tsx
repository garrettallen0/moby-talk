import { useState } from 'react'
import './App.css'
import ForceGraph from './components/ForceGraph'
import { GraphData, Node, Link } from './types/graph'

function App() {
  const [currentChapter, setCurrentChapter] = useState<string>('');
  const [relatedChapters, setRelatedChapters] = useState<string>('');
  const [relationships, setRelationships] = useState<Map<number, number[]>>(new Map());
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], links: [] });

  const handleAddRelationship = () => {
    const chapter = parseInt(currentChapter);
    const related = relatedChapters.split(',').map(ch => parseInt(ch.trim())).filter(ch => !isNaN(ch));

    if (isNaN(chapter) || chapter < 1 || chapter > 135) {
      alert('Please enter a valid chapter number (1-135)');
      return;
    }

    if (related.some(ch => ch < 1 || ch > 135)) {
      alert('All related chapters must be between 1 and 135');
      return;
    }

    setRelationships(prev => {
      const newMap = new Map(prev);
      newMap.set(chapter, related);
      return newMap;
    });

    setCurrentChapter('');
    setRelatedChapters('');
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

  return (
    <div className="container">
      <h1>Moby-Dick Chapter Relationships</h1>
      
      <div className="input-section">
        <div className="input-group">
          <label>
            Chapter Number (1-135):
            <input
              type="number"
              min="1"
              max="135"
              value={currentChapter}
              onChange={(e) => setCurrentChapter(e.target.value)}
            />
          </label>
        </div>
        
        <div className="input-group">
          <label>
            Related Chapters (comma-separated):
            <input
              type="text"
              value={relatedChapters}
              onChange={(e) => setRelatedChapters(e.target.value)}
              placeholder="e.g., 25, 35, 38"
            />
          </label>
        </div>

        <button onClick={handleAddRelationship}>Add Relationship</button>
        <button onClick={generateGraph}>Visualize</button>
      </div>

      <div className="relationships-list">
        <h3>Current Relationships:</h3>
        {Array.from(relationships.entries()).map(([chapter, related]) => (
          <div key={chapter}>
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
