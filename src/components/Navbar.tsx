import { Link } from 'react-router-dom';
import { AuthButton } from './AuthButton';

export function Navbar() {
  return (
    <nav className="flex justify-between items-center px-6 py-4 bg-gradient-to-r from-white via-blue-50 to-white shadow-lg sticky top-0 z-50 border-b border-gray-100 backdrop-blur-sm">
      <div className="flex items-center">
        <Link to="/" className="flex items-center gap-3 text-decoration-none text-gray-900 hover:text-blue-600 transition-colors duration-200 group">
          <div className="w-10 h-10 flex items-center justify-center md:w-8 md:h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-md group-hover:shadow-lg transition-all duration-200">
            <img src="/pyramid-nav.svg" alt="Moby Talk Logo" className="w-6 h-6 md:w-5 md:h-5 object-contain filter brightness-0 invert" />
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-blue-600 bg-clip-text text-transparent md:text-xl">Moby Talk</span>
        </Link>
      </div>
      <div className="flex items-center">
        <AuthButton />
      </div>
    </nav>
  );
} 