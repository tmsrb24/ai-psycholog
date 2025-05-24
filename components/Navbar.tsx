import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSession, signOut } from 'next-auth/react';
import { FaBars, FaTimes, FaUser, FaSignOutAlt, FaUserCircle } from 'react-icons/fa';
// Odebrány FaMoon, FaSun, protože toggleTheme se již nepoužívá

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  // const { theme } = useTheme(); // theme se již nepoužívá, toggleTheme bylo odstraněno
  const router = useRouter();
  const { data: session, status } = useSession();
  const loading = status === "loading";
  const profileMenuRef = useRef<HTMLDivElement>(null);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);
  const toggleProfileMenu = () => setIsProfileMenuOpen(!isProfileMenuOpen);

  const handleSignOut = async () => {
    console.log("Attempting to sign out...");
    try {
      await signOut();
      console.log("Sign out successful (or at least initiated).");
    } catch (error) {
      console.error("Error during sign out:", error);
    }
  };

  const isActive = (path: string) => router.pathname === path;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside, true);
    return () => document.removeEventListener('click', handleClickOutside, true);
  }, []);

  return (
    <nav className="bg-white dark:bg-slate-900 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center" onClick={closeMenu}>
              <div className="bg-gradient-to-r from-blue-600 to-blue-400 text-white py-2 px-3 rounded-lg">
                <span className="font-bold text-xl">Psychollog.cz</span>
              </div>
            </Link>
          </div>

          <div className="hidden md:flex md:items-center md:space-x-4">
            {['Domů', 'Chat', 'Deník', 'GDPR', 'Ceník', 'Kontakt'].map((item) => {
              const path = item === 'Domů' ? '/' : `/${item.toLowerCase().replace('ě', 'e').replace('í', 'i')}`; // Jednoduchá normalizace pro URL
              return (
                <Link
                  key={item}
                  href={path}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    isActive(path)
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                      : 'text-gray-700 hover:bg-gray-100 dark:text-slate-300 dark:hover:bg-slate-800'
                  }`}
                  onClick={closeMenu}
                >
                  {item}
                </Link>
              );
            })}
            
            {loading ? (
              <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse"></div>
            ) : session?.user ? (
              <div className="relative ml-3" ref={profileMenuRef}>
                <button
                  onClick={toggleProfileMenu}
                  className="flex items-center text-sm rounded-full focus:outline-none"
                  aria-expanded={isProfileMenuOpen}
                  aria-haspopup="true"
                >
                  <span className="sr-only">Otevřít uživatelské menu</span>
                  {session.user.image ? (
                    <img className="h-8 w-8 rounded-full" src={session.user.image} alt={session.user.name || "Profilový obrázek"} />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white"><FaUserCircle size={24} /></div>
                  )}
                  <span className="ml-2 text-slate-700 dark:text-slate-300 font-medium">
                    {session.user.name?.split(' ')[0] || 'Uživatel'}
                  </span>
                </button>
                {isProfileMenuOpen && (
                  <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white dark:bg-slate-800 ring-1 ring-black ring-opacity-5 z-50">
                    <div className="px-4 py-2 text-sm text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
                      <p className="font-medium">{session.user.name}</p>
                      <p className="text-slate-500 dark:text-slate-400 truncate">{session.user.email}</p>
                    </div>
                    <Link href="/profile" className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700" onClick={() => setIsProfileMenuOpen(false)}>
                      <div className="flex items-center"><FaUser className="mr-2" />Můj profil</div>
                    </Link>
                    <button onClick={handleSignOut} className="w-full text-left block px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700">
                      <div className="flex items-center"><FaSignOutAlt className="mr-2" />Odhlásit se</div>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2 ml-3">
                <Link href="/auth/login" className="px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">
                  Přihlásit
                </Link>
                <Link href="/auth/register" className="px-3 py-2 rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700">
                  Registrovat
                </Link>
              </div>
            )}
          </div>

          <div className="flex items-center md:hidden">
            {!loading && session?.user && (
              <button onClick={toggleProfileMenu} className="p-2 rounded-full text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 mr-2">
                {session.user.image ? (
                  <img className="h-8 w-8 rounded-full" src={session.user.image} alt={session.user.name || "Profilový obrázek"} />
                ) : (
                  <FaUserCircle size={24} />
                )}
              </button>
            )}
            <button onClick={toggleMenu} className="p-2 rounded-md text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200" aria-label="Toggle menu">
              {isMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white dark:bg-slate-900 shadow-lg">
            {['Domů', 'Chat', 'Deník', 'GDPR', 'Ceník', 'Kontakt'].map((item) => {
               const path = item === 'Domů' ? '/' : `/${item.toLowerCase().replace('ě', 'e').replace('í', 'i')}`;
               return (
                <Link key={item} href={path} className={`block px-3 py-2 rounded-md text-base font-medium ${ isActive(path) ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200' : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'}`} onClick={closeMenu}>
                  {item}
                </Link>
               );
            })}
            {!loading && !session?.user && (
              <>
                <Link href="/auth/login" className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800" onClick={closeMenu}>
                  Přihlásit
                </Link>
                <Link href="/auth/register" className="block px-3 py-2 rounded-md text-base font-medium bg-blue-600 text-white hover:bg-blue-700" onClick={closeMenu}>
                  Registrovat
                </Link>
              </>
            )}
            {!loading && session?.user && (
              <>
                <div className="px-3 py-2 border-t border-slate-200 dark:border-slate-700">
                  <div className="flex items-center">
                    {session.user.image ? (
                      <img className="h-8 w-8 rounded-full mr-2" src={session.user.image} alt={session.user.name || "Profilový obrázek"} />
                    ) : (
                      <FaUserCircle size={24} className="mr-2" />
                    )}
                    <div>
                      <p className="text-base font-medium text-slate-700 dark:text-slate-300">{session.user.name}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{session.user.email}</p>
                    </div>
                  </div>
                </div>
                <Link href="/profile" className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800" onClick={closeMenu}>
                  <div className="flex items-center"><FaUser className="mr-2" />Můj profil</div>
                </Link>
                <button onClick={handleSignOut} className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">
                  <div className="flex items-center"><FaSignOutAlt className="mr-2" />Odhlásit se</div>
                </button>
              </>
            )}
          </div>
        </div>
      )}
      
      {isProfileMenuOpen && !isMenuOpen && session?.user && ( // Přidán null check pro session
        <div className="md:hidden absolute right-0 left-0 z-50"> {/* Zvýšen z-index */}
          <div className="px-2 pt-2 pb-3 mx-4 mt-2 rounded-md bg-white dark:bg-slate-800 shadow-lg ring-1 ring-black ring-opacity-5">
            <div className="px-3 py-2 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center">
                {session.user.image ? (
                  <img className="h-8 w-8 rounded-full mr-2" src={session.user.image} alt={session.user.name || "Profilový obrázek"} />
                ) : (
                  <FaUserCircle size={24} className="mr-2 text-slate-400" />
                )}
                <div>
                  <p className="text-base font-medium text-slate-700 dark:text-slate-300">{session.user.name}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{session.user.email}</p>
                </div>
              </div>
            </div>
            <Link href="/profile" className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700" onClick={() => setIsProfileMenuOpen(false)}>
              <div className="flex items-center"><FaUser className="mr-2" />Můj profil</div>
            </Link>
            <button onClick={handleSignOut} className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700">
              <div className="flex items-center"><FaSignOutAlt className="mr-2" />Odhlásit se</div>
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
