import { useAuth } from '../contexts/AuthContext';
import { GoogleSignInButton } from './GoogleSignInButton';
import '../styles/GoogleSignInButton.css';
import { useState } from 'react';

export const AuthButton = () => {
  const { user, signInWithGoogle, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const getInitials = (name: string | null) => {
    if (!name) return '?';
    return name.charAt(0).toUpperCase();
  };

  const handleLogout = () => {
    logout();
    setIsDropdownOpen(false);
  };

  return (
    <div className="auth-button">
      {user ? (
        <div className="user-info">
          <button 
            className="avatar-button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            aria-label="User menu"
          >
            <div className="avatar-container">
              {user.photoURL && (
                <img 
                  src={user.photoURL} 
                  alt={user.displayName || 'User'} 
                  className="user-avatar photo"
                  onError={(e) => {
                    const target = e.currentTarget;
                    target.style.display = 'none';
                  }}
                />
              )}
              <div className="user-avatar initials">
                {getInitials(user.displayName)}
              </div>
            </div>
          </button>
          
          {isDropdownOpen && (
            <div className="user-dropdown">
              <div className="user-dropdown-header">
                <div className="user-dropdown-avatar">
                  {user.photoURL && (
                    <img 
                      src={user.photoURL} 
                      alt={user.displayName || 'User'} 
                      className="user-avatar photo"
                    />
                  )}
                  <div className="user-avatar initials">
                    {getInitials(user.displayName)}
                  </div>
                </div>
                <div className="user-dropdown-info">
                  <div className="user-dropdown-name">{user.displayName || user.email}</div>
                  <div className="user-dropdown-email">{user.email}</div>
                </div>
              </div>
              <div className="user-dropdown-divider"></div>
              <button onClick={handleLogout} className="user-dropdown-item logout">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="logout-icon">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" x2="9" y1="12" y2="12"></line>
                </svg>
                Sign out
              </button>
            </div>
          )}
        </div>
      ) : (
        <GoogleSignInButton onClick={signInWithGoogle} />
      )}
    </div>
  );
}; 