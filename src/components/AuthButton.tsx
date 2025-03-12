import { useAuth } from '../contexts/AuthContext';

export const AuthButton = () => {
  const { user, signInWithGoogle, logout } = useAuth();

  return (
    <div className="auth-button">
      {user ? (
        <div className="user-info">
          <img src={user.photoURL || ''} alt={user.displayName || 'User'} className="user-avatar" />
          <span className="user-name">{user.displayName}</span>
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