export interface Node {
  id: number;
  chapter: number;
  connections: number; // number of connections for sizing
}

export interface Link {
  source: number;
  target: number;
}

export interface GraphData {
  nodes: Node[];
  links: Link[];
} 