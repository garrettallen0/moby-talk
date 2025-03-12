import { Configuration } from '../types/config';

interface ConfigurationsListProps {
  configurations: Configuration[];
  onLoadConfiguration: (config: Configuration) => void;
  onDeleteConfiguration: (configId: string) => void;
  onClose: () => void;
}

export const ConfigurationsList = ({
  configurations,
  onLoadConfiguration,
  onDeleteConfiguration,
  onClose
}: ConfigurationsListProps) => {
  return (
    <div className="modal">
      <div className="modal-content">
        <h3>Saved Configurations</h3>
        {configurations.length === 0 ? (
          <p>No saved configurations found.</p>
        ) : (
          <div className="configurations-list">
            {configurations.map((config) => (
              <div key={config.id} className="configuration-item">
                <div className="configuration-info">
                  <h4>{config.name}</h4>
                  {config.description && (
                    <p>{config.description}</p>
                  )}
                  <span className="configuration-date">
                    Created: {config.createdAt.toLocaleDateString()}
                  </span>
                </div>
                <div className="configuration-actions">
                  <button
                    onClick={() => onLoadConfiguration(config)}
                    className="load-config-button"
                  >
                    Load
                  </button>
                  <button
                    onClick={() => onDeleteConfiguration(config.id)}
                    className="delete-config-button"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="modal-buttons">
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}; 