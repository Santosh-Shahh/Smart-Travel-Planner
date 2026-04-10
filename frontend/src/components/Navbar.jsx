import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaMapMarkedAlt, FaUserCircle } from 'react-icons/fa';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    setIsMenuOpen(false);
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 group">
              <FaMapMarkedAlt className="h-8 w-8 text-primary-600 transition-transform group-hover:scale-110" />
              <span className="font-bold text-xl tracking-tight text-slate-800">
                Smart<span className="text-primary-600">Travel</span>
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Link 
                  to="/dashboard" 
                  className="text-slate-600 hover:text-primary-600 font-medium transition-colors"
                >
                  My Trips
                </Link>
                <div className="relative" ref={menuRef}>
                  <button 
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <FaUserCircle className="text-slate-500 h-5 w-5" />
                    <span className="text-sm font-medium">{user.name.split(' ')[0]}</span>
                  </button>
                  <div className={`absolute right-0 w-48 mt-2 py-2 bg-white rounded-xl shadow-lg transition-all border border-slate-100 origin-top-right ${isMenuOpen ? 'opacity-100 scale-100 visible' : 'opacity-0 scale-95 invisible'}`}>
                    <button 
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      Sign out
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="text-slate-600 hover:text-primary-600 font-medium transition-colors"
                >
                  Log in
                </Link>
                <Link 
                  to="/register" 
                  className="bg-primary-600 hover:bg-primary-700 text-white px-5 py-2 rounded-full font-medium transition-colors shadow-sm"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
