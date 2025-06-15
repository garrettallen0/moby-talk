import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChapterMap, ChapterAnnotation } from '../types/map';
import { getPublicMaps, getUserMaps } from '../services/mapService';
import { useAuth } from '../contexts/AuthContext';
import { Timestamp } from 'firebase/firestore';
import '../styles/MapDetail.css';

const SPECIAL_CHAPTERS = {
  '-1': 'Extracts',
  '0': 'Etymology',
  '136': 'Epilogue',
} as const;

export function MapDetail() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [map, setMap] = useState<ChapterMap | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
  const [selectedCitation, setSelectedCitation] = useState<number | null>(null);

  useEffect(() => {
    const mapId = location.state?.mapId;
    if (!mapId) {
      navigate('/');
      return;
    }

    const loadMap = async () => {
      try {
        // First try to find in public maps
        const publicMaps = await getPublicMaps();
        const foundMap = publicMaps.find(m => m.id === mapId);
        
        if (foundMap) {
          setMap(foundMap);
          return;
        }

        // If not found in public maps and user is logged in, try user maps
        if (user) {
          const userMaps = await getUserMaps(user.uid);
          const userMap = userMaps.find(m => m.id === mapId);
          if (userMap) {
            setMap(userMap);
          }
        }
      } catch (error) {
        console.error('Error loading map:', error);
      }
    };

    loadMap();
  }, [location.state?.mapId, user, navigate]);

  if (!map) {
    return <div className="loading">Loading...</div>;
  }

  const formatDate = (date: Date | Timestamp) => {
    if (date instanceof Timestamp) {
      return date.toDate().toLocaleDateString();
    }
    return date.toLocaleDateString();
  };

  const handleChapterClick = (chapter: number) => {
    setSelectedChapter(chapter);
  };

  const handleSummaryClick = () => {
    setSelectedChapter(null);
  };

  const getChapterTitle = (chapter: number) => {
    return SPECIAL_CHAPTERS[String(chapter) as keyof typeof SPECIAL_CHAPTERS] || `Chapter ${chapter}`;
  };

  const handleBackClick = () => {
    navigate('/');
  };

  const handleEditClick = () => {
    navigate(`/map/${map.id}/edit`);
  };

  const isOwner = user && map.userId === user.uid;

  const handleCitationClick = (index: number) => {
    setSelectedCitation(index);
  };

  return (
    <div className="map-detail">
      <div className="map-header">
        <button className="back-button" onClick={handleBackClick}>
          ← Back
        </button>
        <h1>{map.name}</h1>
        {isOwner && (
          <button className="edit-button" onClick={handleEditClick}>
            Edit Map
          </button>
        )}
      </div>

      <div className="map-navigation">
        <button 
          className={`nav-button summary-button ${selectedChapter === null ? 'active' : ''}`}
          onClick={handleSummaryClick}
        >
          Summary
        </button>
        <div className="nav-divider" />
        {map.selectedChapters.sort((a, b) => a - b).map(chapter => (
          <button
            key={chapter}
            className={`nav-button ${selectedChapter === chapter ? 'active' : ''}`}
            onClick={() => handleChapterClick(chapter)}
          >
            {getChapterTitle(chapter)}
          </button>
        ))}
      </div>

      <div className="map-content">
        {selectedChapter === null ? (
          <div className="map-summary">
            {map.description || 'No summary available.'}
          </div>
        ) : (
          <div className="chapter-annotation">
            <div className="annotation">
              {map.chapterAnnotations?.[selectedChapter]?.annotation || 'No annotation available.'}
            </div>
            
            {selectedCitation !== null && map.chapterAnnotations?.[selectedChapter]?.citations[selectedCitation] && (
              <div className="citation">
                <div className="citation-passage">
                  {map.chapterAnnotations[selectedChapter].citations[selectedCitation].passage}
                </div>
              </div>
            )}

            <div className="citation-footer">
              <div className="citation-count">
                <span>Citations</span>
                <div className="citation-bubbles">
                  {Array.from({ length: map.chapterAnnotations?.[selectedChapter]?.citations.length || 0 }).map((_, index) => (
                    <div
                      key={index}
                      className={`citation-bubble ${index === selectedCitation ? 'active' : ''}`}
                      onClick={() => handleCitationClick(index)}
                    >
                      {index + 1}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="map-theme">
        <p>{map.theme || 'No theme specified.'}</p>
      </div>

      <div className="map-footer">
        <div className="map-metadata">
          <span className="map-date">{formatDate(map.createdAt)}</span>
          <span className="map-creator">{map.userName}</span>
        </div>
        <div className="map-actions">
          <button className="action-button like-button">
            ↑ {map.likes?.length || 0}
          </button>
          <button className="action-button comment-button">
            💬 {map.comments?.length || 0}
          </button>
        </div>
      </div>
    </div>
  );
} 