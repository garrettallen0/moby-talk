import { useEffect, useState } from 'react';
import { ChapterMap, ChapterAnnotation } from '../types/map';
import { Timestamp } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { SignInModal } from './SignInModal';
import { CommentModal } from './CommentModal';
import { ConfirmationModal } from './ConfirmationModal';
import trashIcon from '../assets/trashIcon.png';

interface MapCardProps {
  map: ChapterMap;
  onCardClick: (map: ChapterMap) => void;
  onLike?: (mapId: string) => void;
  onComment?: (mapId: string, text: string) => void;
  isPublicView?: boolean;
  onDelete?: (mapId: string) => void;
}

const SPECIAL_CHAPTERS = {
  '-1': 'Extracts',
  '0': 'Etymology',
  '136': 'Epilogue',
} as const;

export const MapCard = ({
  map,
  onCardClick,
  onLike,
  onComment,
  isPublicView = false,
  onDelete,
}: MapCardProps) => {
  const { user } = useAuth();
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [selectedCitation, setSelectedCitation] = useState<number | null>(null);

  const [chapterAnnotations, setChapterAnnotations] = useState<Record<number, ChapterAnnotation>>(() => {
    return map.chapterAnnotations || {};
  });

  useEffect(() => {
    setChapterAnnotations(map.chapterAnnotations || {});
  }, [map]);

  const hasLiked = user && map.likes?.includes(user.uid);

  const formatDate = (date: Date | Timestamp) => {
    if (date instanceof Timestamp) {
      return date.toDate().toLocaleDateString();
    }
    return date.toLocaleDateString();
  };

  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      setShowSignInModal(true);
      return;
    }
    onLike?.(map.id);
  };

  const handleCommentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      setShowSignInModal(true);
      return;
    }
    setShowCommentModal(true);
  };

  const handleSignIn = () => {
    setShowSignInModal(false);
  };

  const handleChapterClick = (e: React.MouseEvent, chapter: number) => {
    e.stopPropagation();
    setSelectedChapter((prev) => (prev === chapter ? null : chapter));
    setSelectedCitation(null);
  };

  const handleCitationClick = (index: number) => {
    setSelectedCitation(index);
  };

  const getChapterTitle = (chapter: number) => {
    return (
      SPECIAL_CHAPTERS[String(chapter) as keyof typeof SPECIAL_CHAPTERS] ||
      `Chapter ${chapter}`
    );
  };

  return (
    <>
      <div className={`map-card ${isPublicView ? 'public-view' : ''}`}>
        {!isPublicView && (
          <img
            className="trash-icon"
            src={trashIcon}
            alt="delete map icon"
            onClick={(e) => {
              e.stopPropagation();
              setShowDeleteConfirmation(true);
            }}
          />
        )}

        <div className="map-body">
          <div className="map-content">
            <div
              className="map-info"
              onClick={() => onCardClick(map)}
              role="button"
              tabIndex={0}
            >
              <h3>{map.name}</h3>
              {map.selectedChapters.length > 0 && (
                <div className="selected-chapters-mini">
                  <h4
                    className="chapters-heading"
                    data-element="chapter-heading"
                  >
                    Chapters
                  </h4>
                  <div className="chapter-grid">
                    {map.selectedChapters
                      .sort((a, b) => a - b)
                      .map((chapter) => (
                        <button
                          key={chapter}
                          className={`chapter-button selected-primary chapter-mini ${
                            selectedChapter === chapter ? 'active' : ''
                          }`}
                          onClick={(e) => handleChapterClick(e, chapter)}
                          aria-pressed={selectedChapter === chapter}
                        >
                          {chapter}
                        </button>
                      ))}
                  </div>
                  <div className="divider"></div>
                  <div className="chapter-count-display">
                    <span className="chapter-count">
                      {map.selectedChapters.length}
                    </span>
                    <span className="chapter-label">Chapters</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className={`map-content ${isPublicView ? 'public-view' : ''}`}>
            <div
              className={`map-commentary ${
                selectedChapter !== null &&
                chapterAnnotations[selectedChapter]?.annotation
                  ? 'has-annotations'
                  : ''
              }`}
              role="button"
              tabIndex={0}
            >
              {selectedChapter !== null ? (
                chapterAnnotations[selectedChapter] ? (
                  <div className="chapter-annotations">
                    <h3>{getChapterTitle(selectedChapter)}</h3>
                    <div className="annotation-content">
                      <div className="annotation-field">
                        <label>Annotation</label>
                        <div className="annotation-text">
                          {chapterAnnotations[selectedChapter].annotation}
                        </div>
                      </div>
                      {selectedCitation !== null && 
                       chapterAnnotations[selectedChapter].citations[selectedCitation] && (
                        <div className="citation-field">
                          <label>Citation</label>
                          <div className="citation-text">
                            {chapterAnnotations[selectedChapter].citations[selectedCitation].passage}
                          </div>
                        </div>
                      )}
                    </div>
                    {chapterAnnotations[selectedChapter].citations.length > 0 && (
                      <div className="citation-footer">
                        <div className="citation-count">
                          <span>Citations</span>
                          <div className="citation-bubbles">
                            {chapterAnnotations[selectedChapter].citations.map((_, index) => (
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
                    )}
                  </div>
                ) : (
                  <div className="map-commentary-placeholder">
                    There are no annotations yet for this chapter
                  </div>
                )
              ) : map.description ? (
                <div className="map-description-container">
                  <h3>Summary</h3>
                  <div className="map-description">{map.description}</div>
                </div>
              ) : (
                <div className="map-commentary-placeholder">
                  Click a chapter to view its annotations
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="map-footer">
          <div className="map-metadata">
            <span className="map-date">{formatDate(map.createdAt)}</span>
            {!isPublicView && (
              <span
                className={`visibility-badge ${
                  map.isPublic ? 'public' : 'private'
                }`}
              >
                {map.isPublic ? 'Public' : 'Private'}
              </span>
            )}
          </div>
          <div className="map-actions">
            <button
              className={`comment-button ${showCommentModal ? 'active' : ''}`}
              onClick={handleCommentClick}
              aria-label="Show comments"
            >
              💬
              <span className="comments-count">
                {map.comments?.length || 0}
              </span>
            </button>
            <button
              className={`upvote-button ${hasLiked ? 'active' : ''}`}
              onClick={handleLikeClick}
              aria-label="Upvote map"
            >
              ↑<span className="likes-count">{map.likes?.length || 0}</span>
            </button>
          </div>
        </div>
      </div>

      {showSignInModal && (
        <SignInModal
          onClose={() => setShowSignInModal(false)}
          onSignIn={handleSignIn}
        />
      )}

      {showCommentModal && (
        <CommentModal
          map={map}
          onClose={() => setShowCommentModal(false)}
          onComment={onComment || (() => {})}
        />
      )}

      {showDeleteConfirmation && (
        <ConfirmationModal
          message="Are you sure you want to delete this map?"
          confirmText="Yes, delete"
          onConfirm={() => {
            onDelete?.(map.id);
            setShowDeleteConfirmation(false);
          }}
          onCancel={() => setShowDeleteConfirmation(false)}
        />
      )}
    </>
  );
};
