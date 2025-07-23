import { Link } from 'react-router-dom';
import { AuthButton } from './AuthButton';

export function Navbar() {
  return (
    <nav className="flex justify-between items-center px-8 py-4 bg-white shadow-md sticky top-0 z-50">
      <div className="flex items-center">
        <Link to="/" className="flex items-center gap-3 text-decoration-none text-gray-900 hover:text-gray-700">
          <div className="w-8 h-8 flex items-center justify-center md:w-6 md:h-6">
            <img src="/pyramid-nav.svg" alt="Moby Talk Logo" className="w-full h-full object-contain" />
          </div>
          <span className="text-xl font-semibold text-gray-900 md:text-lg">Moby Talk</span>
        </Link>
      </div>
      <div className="flex items-center">
        <AuthButton />
      </div>
    </nav>
  );
} 