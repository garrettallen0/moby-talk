import { useState } from 'react';
import { ChapterMap } from '../types/map';

interface MapModalProps {
  map?: ChapterMap;
  onSave: (data: { name: string; description?: string; isPublic: boolean }) => void;
  onClose: () => void;
}

export const MapModal = ({ map, onSave, onClose }: MapModalProps) => {
  const [name, setName] = useState(map?.name || '');
  const [description, setDescription] = useState(map?.description || '');
  const [isPublic, setIsPublic] = useState(map?.isPublic || false);

  const handleSubmit = () => {
    if (!name.trim()) return;
    onSave({
      name: name.trim(),
      description: description.trim() || undefined,
      isPublic
    });
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h3>{map ? 'Edit Map' : 'Create New Map'}</h3>
        <input
          type="text"
          placeholder="Map Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="map-input"
        />
        <textarea
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="map-input"
        />
        <div className="visibility-toggle">
          <label className="toggle-label">
            <span>Make this map public</span>
            <div
              className={`toggle-switch ${isPublic ? 'active' : ''}`}
              onClick={() => setIsPublic(!isPublic)}
            >
              <div className="toggle-slider" />
            </div>
          </label>
          <p className="visibility-hint">
            {isPublic
              ? 'This map will be visible to anyone who visits the site'
              : 'Only you can see this map'}
          </p>
        </div>
        <div className="modal-buttons">
          <button
            onClick={handleSubmit}
            disabled={!name.trim()}
            className="save-button"
          >
            {map ? 'Save Changes' : 'Create Map'}
          </button>
          <button onClick={onClose} className="cancel-button">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}; 