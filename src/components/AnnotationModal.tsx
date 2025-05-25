import { useState } from 'react';
import { Annotation } from '../types/map';

interface AnnotationModalProps {
  chapter: number;
  chapterTitle: string;
  annotations: Annotation[];
  onClose: () => void;
  onSave: (annotations: Annotation[]) => void;
}

export const AnnotationModal = ({ chapter, chapterTitle, annotations: initialAnnotations, onClose, onSave }: AnnotationModalProps) => {
  const [annotations, setAnnotations] = useState<Annotation[]>(initialAnnotations);

  const handleAddAnnotation = () => {
    setAnnotations([...annotations, { passage: '', commentary: '' }]);
  };

  const handleUpdateAnnotation = (index: number, field: 'passage' | 'commentary', value: string) => {
    const newAnnotations = [...annotations];
    newAnnotations[index] = { ...newAnnotations[index], [field]: value };
    setAnnotations(newAnnotations);
  };

  const handleDeleteAnnotation = (index: number) => {
    setAnnotations(annotations.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    onSave(annotations);
    onClose();
  };

  return (
    <div className="annotation-modal">
      <div className="modal-overlay" onClick={onClose} />
      <div className="modal-content">
        <div className="modal-header">
          <h2>{chapterTitle}</h2>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>

        <div className="modal-body">
          <div className="annotations-list">
            {annotations.map((annotation, index) => (
              <div key={index} className="annotation-item">
                <div className="annotation-header">
                  <h3>Annotation {index + 1}</h3>
                  <button 
                    className="delete-annotation-button"
                    onClick={() => handleDeleteAnnotation(index)}
                  >
                    Delete
                  </button>
                </div>
                <div className="annotation-content">
                  <div className="annotation-field">
                    <label>Passage</label>
                    <textarea
                      value={annotation.passage}
                      onChange={(e) => handleUpdateAnnotation(index, 'passage', e.target.value)}
                      placeholder="Enter the text passage..."
                      rows={3}
                    />
                  </div>
                  <div className="annotation-field">
                    <label>Commentary</label>
                    <textarea
                      value={annotation.commentary}
                      onChange={(e) => handleUpdateAnnotation(index, 'commentary', e.target.value)}
                      placeholder="Enter your commentary..."
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="annotation-actions">
            <button className="add-annotation-button" onClick={handleAddAnnotation}>
              Add Annotation
            </button>
            <div className="modal-buttons">
              <button className="save-button" onClick={handleSave}>
                Save Changes
              </button>
              <button className="cancel-button" onClick={onClose}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 