export interface GraphNode {
  id: number;
  chapter: number;
  connections: number; // number of connections for sizing
  x?: number; // optional x position
  y?: number; // optional y position
}

export interface Link {
  source: number;
  target: number;
}

export interface GraphData {
  nodes: GraphNode[];
  links: Link[];
} 