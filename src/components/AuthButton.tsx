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