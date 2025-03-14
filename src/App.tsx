import { useState, useEffect } from 'react'
import './App.css'
import ForceGraph from './components/ForceGraph'
import { GraphData, Node, Link } from './types/graph'
import { AuthButton } from './components/AuthButton'
import { useAuth } from './contexts/AuthContext'
import { Configuration } from './types/config'
import { saveConfiguration, getUserConfigurations, deleteConfiguration } from './services/configurationService'
import { ConfigurationsList } from './components/ConfigurationsList'
import { ChapterMap } from './types/map'
import { MapList } from './components/MapList'
import { saveMap, getPublicMaps, getUserMaps, deleteMap, updateMap } from './services/mapService'
import { MapModal } from './components/MapModal'

// Special chapters with their IDs
const SPECIAL_CHAPTERS = {
  '-1': 'Extracts',
  '0': 'Etymology',
  '136': 'Epilogue'
} as const;

type ActiveTab = 'public' | 'my-maps';

function App() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<ActiveTab>('public');
  const [isCreatingMap, setIsCreatingMap] = useState(false);
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
  const [relatedChapters, setRelatedChapters] = useState<Set<number>>(new Set());
  const [relationships, setRelationships] = useState<Map<number, number[]>>(new Map());
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], links: [] });
  const [isEditing, setIsEditing] = useState(false);
  const [isRelationshipsOpen, setIsRelationshipsOpen] = useState(true);
  const [configurations, setConfigurations] = useState<Configuration[]>([]);
  const [configName, setConfigName] = useState('');
  const [configDescription, setConfigDescription] = useState('');
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [isConfigListOpen, setIsConfigListOpen] = useState(false);
  const [publicMaps, setPublicMaps] = useState<ChapterMap[]>([]);
  const [userMaps, setUserMaps] = useState<ChapterMap[]>([]);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);

  // Generate array of all chapters in sequence (-1, 0, 1-135, 136)
  const allChapters = [-1, 0, ...Array.from({ length: 135 }, (_, i) => i + 1), 136];

  useEffect(() => {
    // Load public maps
    const loadMaps = async () => {
      try {
        const publicMapsList = await getPublicMaps();
        setPublicMaps(publicMapsList);

        if (user) {
          const userMapsList = await getUserMaps(user.uid);
          setUserMaps(userMapsList);
        } else {
          setUserMaps([]);
        }
      } catch (error) {
        console.error('Error loading maps:', error);
      }
    };

    loadMaps();
  }, [user]);

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
    updateGraphData(newRelationships);

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

  const getChapterStyle = (chapter: number) => {
    if (chapter === selectedChapter) return "chapter-button selected-primary";
    if (relatedChapters.has(chapter)) return "chapter-button selected-related";
    return "chapter-button";
  };

  const loadConfigurations = async () => {
    if (!user) return;
    try {
      const userConfigs = await getUserConfigurations(user.uid);
      setConfigurations(userConfigs);
      // TODO: Add UI for selecting and loading a specific configuration
    } catch (error) {
      console.error('Error loading configurations:', error);
    }
  };

  const handleSaveConfiguration = async () => {
    if (!user || !configName.trim()) return;
    
    try {
      await saveConfiguration(
        user.uid,
        configName.trim(),
        Array.from(relationships.entries()).map(([sourceChapter, relatedChapters]) => ({
          sourceChapter,
          relatedChapters
        })),
        configDescription.trim() || undefined
      );

      // Reset form
      setConfigName('');
      setConfigDescription('');
      setIsConfigModalOpen(false);

      // Reload configurations
      await loadConfigurations();
    } catch (error) {
      console.error('Error saving configuration:', error);
    }
  };

  const handleLoadConfiguration = (config: Configuration) => {
    // Convert relationships array to Map
    const newRelationships = new Map<number, number[]>();
    config.relationships.forEach(rel => {
      newRelationships.set(rel.sourceChapter, rel.relatedChapters);
    });
    
    setRelationships(newRelationships);
    setIsConfigListOpen(false);

    // Update graph data
    const nodes: Node[] = [];
    const links: Link[] = [];
    const connectionsCount = new Map<number, number>();

    // Count connections for each chapter
    newRelationships.forEach((related, chapter) => {
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
    newRelationships.forEach((related, chapter) => {
      related.forEach(r => {
        links.push({
          source: chapter,
          target: r
        });
      });
    });

    setGraphData({ nodes, links });
  };

  const handleDeleteConfiguration = async (configId: string) => {
    if (!user) return;
    
    try {
      await deleteConfiguration(configId);
      await loadConfigurations();
    } catch (error) {
      console.error('Error deleting configuration:', error);
    }
  };

  const handleSaveMap = async (data: { name: string; description?: string; isPublic: boolean }) => {
    if (!user) return;
    
    console.log('Debug - User auth state:', {
      isAuthenticated: !!user,
      userId: user.uid,
      email: user.email
    });
    
    try {
      const relationshipArray = Array.from(relationships.entries()).map(([sourceChapter, relatedChapters]) => ({
        sourceChapter,
        relatedChapters
      }));

      await saveMap(
        user.uid,
        data.name,
        relationshipArray,
        data.description,
        data.isPublic
      );

      // Reset form and state
      setIsMapModalOpen(false);
      setRelationships(new Map());
      setGraphData({ nodes: [], links: [] });
      setIsCreatingMap(false);

      // Reload maps
      const [newPublicMaps, newUserMaps] = await Promise.all([
        getPublicMaps(),
        getUserMaps(user.uid)
      ]);
      setPublicMaps(newPublicMaps);
      setUserMaps(newUserMaps);
    } catch (error) {
      console.error('Error saving map:', error);
    }
  };

  const handleDeleteMap = async (mapId: string) => {
    if (!user) return;
    
    try {
      await deleteMap(mapId);
      
      // Reload maps
      const [newPublicMaps, newUserMaps] = await Promise.all([
        getPublicMaps(),
        getUserMaps(user.uid)
      ]);
      setPublicMaps(newPublicMaps);
      setUserMaps(newUserMaps);
    } catch (error) {
      console.error('Error deleting map:', error);
    }
  };

  const handleViewMap = (map: ChapterMap) => {
    // Convert map relationships to the format used by the graph
    const newRelationships = new Map<number, number[]>();
    map.relationships.forEach(rel => {
      newRelationships.set(rel.sourceChapter, rel.relatedChapters);
    });
    
    setRelationships(newRelationships);
    updateGraphData(newRelationships);
  };

  const handleEditMap = async (map: ChapterMap) => {
    if (!user) return;
    
    try {
      await updateMap(map.id, map);
      
      // Reload maps after update
      const [newPublicMaps, newUserMaps] = await Promise.all([
        getPublicMaps(),
        getUserMaps(user.uid)
      ]);
      setPublicMaps(newPublicMaps);
      setUserMaps(newUserMaps);
    } catch (error) {
      console.error('Error updating map:', error);
    }
  };

  const handleTabChange = (tab: 'public' | 'my-maps') => {
    setActiveTab(tab);
    if (tab === 'public') {
      setIsCreatingMap(false);
    }
  };

  const handleCreateMap = () => {
    if (!user) {
      return; // MapList component will handle the login prompt
    }
    setIsCreatingMap(true);
  };

  const updateGraphData = (relationships: Map<number, number[]>) => {
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
      <AuthButton />
      <h1>Moby-Dick Chapter Relationships</h1>
      
      <MapList
        publicMaps={publicMaps}
        userMaps={userMaps}
        onViewMap={handleViewMap}
        onEditMap={handleEditMap}
        onDeleteMap={handleDeleteMap}
        onCreateMap={handleCreateMap}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />

      {activeTab === 'my-maps' && isCreatingMap && (
        <>
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

          {user && (
            <div className="config-controls">
              <button 
                className="save-button"
                onClick={() => setIsMapModalOpen(true)}
                disabled={relationships.size === 0}
              >
                Save Map
              </button>
            </div>
          )}
        </>
      )}

      {isMapModalOpen && (
        <MapModal
          onSave={handleSaveMap}
          onClose={() => setIsMapModalOpen(false)}
        />
      )}
    </div>
  )
}

export default App
