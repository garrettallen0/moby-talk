import { ChapterMap } from '../types/map';
import { Timestamp } from 'firebase/firestore';
import ForceGraph from './ForceGraph';
import { GraphData } from '../types/graph';

interface MapCardProps {
  map: ChapterMap;
  onView: (map: ChapterMap) => void;
  onEdit?: (map: ChapterMap) => void;
  onDelete?: (mapId: string) => void;
  isPublicView?: boolean;
}

export const MapCard = ({ map, onView, onEdit, onDelete, isPublicView = false }: MapCardProps) => {
  const isOwner = onEdit && onDelete;

  const formatDate = (date: Date | Timestamp) => {
    if (date instanceof Timestamp) {
      return date.toDate().toLocaleDateString();
    }
    return date.toLocaleDateString();
  };

  // Convert relationships to graph data
  const graphData: GraphData = {
    nodes: [],
    links: []
  };

  // Create a set of all chapters involved
  const chapters = new Set<number>();
  map.relationships.forEach(rel => {
    chapters.add(rel.sourceChapter);
    rel.relatedChapters.forEach(chapter => chapters.add(chapter));
  });

  // Create nodes
  chapters.forEach(chapter => {
    graphData.nodes.push({
      id: chapter,
      chapter: chapter,
      connections: 0 // We'll calculate this next
    });
  });

  // Create links and count connections
  map.relationships.forEach(rel => {
    rel.relatedChapters.forEach(target => {
      graphData.links.push({
        source: rel.sourceChapter,
        target: target
      });
      // Increment connection count for both source and target
      const sourceNode = graphData.nodes.find(n => n.id === rel.sourceChapter);
      const targetNode = graphData.nodes.find(n => n.id === target);
      if (sourceNode) sourceNode.connections++;
      if (targetNode) targetNode.connections++;
    });
  });

  return (
    <div className="map-card">
      <div className="mini-graph">
        <ForceGraph
          data={graphData}
          width={200}
          height={150}
          miniature={true}
        />
      </div>
      <div className="map-footer">
        <div className="map-metadata">
          <span className="map-date">{formatDate(map.createdAt)}</span>
          {!isPublicView && (
            <span className={`visibility-badge ${map.isPublic ? 'public' : 'private'}`}>
              {map.isPublic ? 'Public' : 'Private'}
            </span>
          )}
        </div>
        <div className="map-actions">
          <button onClick={() => onView(map)} className="view-map-button">
            View
          </button>
          {isOwner && !isPublicView && (
            <>
              <button onClick={() => onEdit(map)} className="edit-map-button">
                Edit
              </button>
              <button onClick={() => onDelete(map.id)} className="delete-map-button">
                Delete
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}; 