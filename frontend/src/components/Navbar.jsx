import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { signInWithPopup, signOut } from 'firebase/auth';
import { auth, provider } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { Menu, X } from 'lucide-react';

const Navbar = () => {
  const { user } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setDropdownOpen(false);
    setMobileMenuOpen(false);
  };

  const linkClass = ({ isActive }) =>
    `font-medium ${isActive ? 'text-[#1E2A4A] font-bold' : 'text-gray-600 hover:text-[#1E2A4A]'}`;

  const Avatar = ({ size = 8 }) =>
    user.photoURL ? (
      <img
        src={user.photoURL}
        alt="Profile"
        referrerPolicy="no-referrer"
        className={`w-${size} h-${size} rounded-full border border-gray-300 object-cover`}
      />
    ) : (
      <div className={`w-${size} h-${size} rounded-full bg-[#1E2A4A] text-white flex items-center justify-center text-sm font-semibold`}>
        {user.displayName?.charAt(0).toUpperCase()}
      </div>
    );

  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-3 relative">
      <div className="flex justify-between items-center">
        <NavLink to="/" className="text-2xl font-extrabold text-[#1E2A4A]">QuickGig</NavLink>

        {/* Desktop links — hidden on small screens */}
        <div className="hidden md:flex items-center gap-4">
          <NavLink to="/gigs" className={linkClass}>Explore Gigs</NavLink>
          <NavLink to="/post-gig" className={linkClass}>Post a Gig</NavLink>

          {user ? (
            <div className="relative">
              <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center gap-2 focus:outline-none">
                {user.photoURL ? (
                  <img src={user.photoURL} alt="Profile" referrerPolicy="no-referrer" className="w-8 h-8 rounded-full border border-gray-300 object-cover" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-[#1E2A4A] text-white flex items-center justify-center text-sm font-semibold">
                    {user.displayName?.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="font-medium text-sm text-gray-700">{user.displayName}</span>
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
                  <NavLink to="/profile" onClick={() => setDropdownOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                    My Profile
                  </NavLink>
                  <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-50">
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button onClick={handleLogin} className="bg-[#1E2A4A] text-white px-5 py-2 rounded-md font-medium hover:bg-[#16203a] transition">
              Login with Google
            </button>
          )}
        </div>

        {/* Hamburger — visible only on small screens */}
        <button className="md:hidden text-[#1E2A4A]" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {/* Mobile dropdown menu */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-4 pb-2 flex flex-col gap-4 border-t border-gray-100 pt-4">
          <NavLink to="/gigs" onClick={() => setMobileMenuOpen(false)} className={linkClass}>Explore Gigs</NavLink>
          <NavLink to="/post-gig" onClick={() => setMobileMenuOpen(false)} className={linkClass}>Post a Gig</NavLink>

          {user ? (
            <>
              <NavLink to="/profile" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2">
                {user.photoURL ? (
                  <img src={user.photoURL} alt="Profile" referrerPolicy="no-referrer" className="w-8 h-8 rounded-full border border-gray-300 object-cover" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-[#1E2A4A] text-white flex items-center justify-center text-sm font-semibold">
                    {user.displayName?.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="font-medium text-sm text-gray-700">{user.displayName}</span>
              </NavLink>
              <button onClick={handleLogout} className="text-left text-red-500 text-sm font-medium">
                Logout
              </button>
            </>
          ) : (
            <button onClick={handleLogin} className="bg-[#1E2A4A] text-white px-5 py-2 rounded-md font-medium hover:bg-[#16203a] transition text-left">
              Login with Google
            </button>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;