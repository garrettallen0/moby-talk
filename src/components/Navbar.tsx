import { Link } from 'react-router-dom';
import { AuthButton } from './AuthButton';
import '../styles/Navbar.css';

export function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link to="/" className="navbar-brand">
          <div className="pyramid-icon">
            <img src="/pyramid-nav.svg" alt="Moby Talk Logo" />
          </div>
          <span className="site-name">Moby Talk</span>
        </Link>
      </div>
      <div className="navbar-right">
        <AuthButton />
      </div>
    </nav>
  );
} 