import { useAuth } from '../contexts/AuthContext';

export const AuthButton = () => {
  const { user, signInWithGoogle, logout } = useAuth();

  const getInitials = (name: string | null) => {
    if (!name) return '?';
    return name.charAt(0).toUpperCase();
  };

  console.log('User data:', {
    displayName: user?.displayName,
    photoURL: user?.photoURL,
    email: user?.email
  });

  return (
    <div className="auth-button">
      {user ? (
        <div className="user-info">
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
          <span className="user-name">{user.displayName || user.email}</span>
          <button onClick={logout} className="logout-button">
            Logout
          </button>
        </div>
      ) : (
        <button onClick={signInWithGoogle} className="login-button">
          Sign in with Google
        </button>
      )}
    </div>
  );
}; 