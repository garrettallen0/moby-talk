import { useState, useEffect, useRef } from 'react';
import '../styles/ChapterWheel.css';

interface ChapterWheelProps {
  selectedChapters: number[];
  theme: string;
  onChapterClick?: (chapterId: number) => void;
  width?: number;
  height?: number;
}

export const ChapterWheel: React.FC<ChapterWheelProps> = ({
  selectedChapters,
  theme,
  onChapterClick,
  width = 600,
  height = 600
}) => {
  const [rotation, setRotation] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Calculate the angle for each chapter based on total number of chapters
  const getChapterPosition = (index: number, total: number) => {
    const angle = (index * 2 * Math.PI) / total;
    const radius = Math.min(width, height) / 2.5;
    
    return {
      angle,
      x: radius * Math.sin(angle),
      y: -radius * Math.cos(angle)
    };
  };
  
  const handleChapterClick = (chapterId: number, index: number) => {
    if (onChapterClick) {
      onChapterClick(chapterId);
    }
    
    // Calculate rotation to bring the clicked chapter to the top (12 o'clock position)
    const total = selectedChapters.length;
    const anglePerChapter = 360 / total;
    
    // Calculate the current angle of the clicked chapter
    const currentAngle = index * anglePerChapter;
    
    // Set rotation to bring this chapter to the top
    setRotation(-currentAngle);
  };
  
  return (
    <div 
      className="chapter-wheel-container" 
      ref={containerRef}
      style={{ width: `${width}px`, height: `${height}px` }}
    >
      {/* Center hub - the theme */}
      <div className="wheel-hub">
        <span>{theme || 'Theme'}</span>
      </div>
      
      {/* Wheel with spokes */}
      <div 
        className="wheel" 
        style={{ 
          transform: `rotate(${rotation}deg)`,
          width: `${width}px`,
          height: `${height}px` 
        }}
      >
        {selectedChapters.map((chapter, index) => {
          const position = getChapterPosition(index, selectedChapters.length);
          const translateX = width/2 + position.x;
          const translateY = height/2 + position.y;
          
          return (
            <div 
              key={chapter}
              className="chapter-node"
              style={{
                transform: `translate(${translateX}px, ${translateY}px) rotate(${-rotation}deg)`,
              }}
              onClick={() => handleChapterClick(chapter, index)}
            >
              <div className="spoke-line" 
                   style={{ 
                     transform: `rotate(${(position.angle * 180 / Math.PI)}deg)`,
                     width: `${Math.min(width, height)/2.5}px`
                   }}
              />
              <div className="chapter-label">
                Ch. {chapter}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ChapterWheel; 