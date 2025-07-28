import { useAuth } from '../contexts/AuthContext';
import { GoogleSignInButton } from './GoogleSignInButton';
import '../styles/GoogleSignInButton.css';
import { useState, useEffect, useRef } from 'react';

export const AuthButton = () => {
  const { user, signInWithGoogle, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isDropdownOpen]);

  const getInitials = (name: string | null) => {
    if (!name) return '?';
    return name.charAt(0).toUpperCase();
  };

  const handleLogout = () => {
    logout();
    setIsDropdownOpen(false);
  };

  return (
    <div className="flex justify-end relative">
      {user ? (
        <div className="relative" ref={dropdownRef}>
          <button 
            className="bg-none border-none p-0 cursor-pointer rounded-full transition-transform duration-200 ease-in-out hover:scale-105"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            aria-label="User menu"
          >
            <div className="relative w-8 h-8 flex-shrink-0">
              {user.photoURL && (
                <img 
                  src={user.photoURL} 
                  alt={user.displayName || 'User'} 
                  className="w-8 h-8 rounded-full absolute top-0 left-0 object-cover z-10"
                  onError={(e) => {
                    const target = e.currentTarget;
                    target.style.display = 'none';
                  }}
                />
              )}
              <div className="w-8 h-8 rounded-full absolute top-0 left-0 bg-blue-500 text-white flex items-center justify-center font-medium text-base z-0">
                {getInitials(user.displayName)}
              </div>
            </div>
          </button>
          
          {isDropdownOpen && (
            <div className="absolute top-full right-0 w-72 bg-white rounded-lg shadow-lg z-50 overflow-hidden mt-2">
              <div className="p-4 flex items-center gap-3">
                <div className="relative w-8 h-8">
                  {user.photoURL && (
                    <img 
                      src={user.photoURL} 
                      alt={user.displayName || 'User'} 
                      className="w-8 h-8 rounded-full absolute top-0 left-0 object-cover z-10"
                    />
                  )}
                  <div className="w-8 h-8 rounded-full absolute top-0 left-0 bg-blue-500 text-white flex items-center justify-center font-medium text-base z-0">
                    {getInitials(user.displayName)}
                  </div>
                </div>
                <div className="flex-1 text-left">
                  <div className="font-medium text-gray-900 text-sm">{user.displayName || user.email}</div>
                  <div className="text-gray-500 text-xs">{user.email}</div>
                </div>
              </div>
              <div className="h-px bg-gray-200"></div>
              <button onClick={handleLogout} className="flex items-center gap-3 w-full py-3 px-4 border-none bg-none text-left text-gray-900 text-sm cursor-pointer transition-colors duration-200 ease-in-out hover:bg-red-50 text-red-500 rounded-b-lg">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 flex-shrink-0">
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