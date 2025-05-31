import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSession, signOut } from 'next-auth/react';
import { FaBars, FaTimes, FaUser, FaSignOutAlt, FaUserCircle } from 'react-icons/fa';
import { useTheme } from './ThemeProvider';
import { useTranslation } from 'next-i18next';

const Navbar: React.FC = () => {
  const { t } = useTranslation('common');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const { theme } = useTheme();
  const router = useRouter();
  const { data: session, status } = useSession();
  const loading = status === "loading";
  const profileMenuRef = useRef<HTMLDivElement>(null);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const toggleProfileMenu = () => {
    setIsProfileMenuOpen(!isProfileMenuOpen);
  };

  const handleSignOut = async () => {
    console.log("Attempting to sign out..."); // Debug log
    try {
      await signOut(); // Výchozí chování s přesměrováním
      // router.push('/'); // Toto by nemělo být potřeba, signOut by měl přesměrovat
      console.log("Sign out successful (or at least initiated).");
    } catch (error) {
      console.error("Error during sign out:", error);
    }
  };

  const isActive = (path: string) => {
    return router.pathname === path;
  };

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };

    // Použijeme 'click' místo 'mousedown', aby se menu nezavřelo dříve, než se provede akce na tlačítku uvnitř
    document.addEventListener('click', handleClickOutside, true); // Použijeme capturing fázi pro jistotu
    return () => {
      document.removeEventListener('click', handleClickOutside, true);
    };
  }, []);

  return (
    // Změna pozadí Navbaru: méně průhledné, pevnější barvy pro lepší kontrast a vzhled
    <nav className="bg-white/90 dark:bg-slate-900/90 shadow-lg sticky top-0 z-50 backdrop-blur-md"> 
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center" onClick={closeMenu}>
              {/* Logo zůstává s vlastním gradientem, aby bylo viditelné */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-400 text-white py-2 px-3 rounded-lg">
                <span className="font-bold text-xl">Psychollog.cz</span>
              </div>
            </Link>
          </div>

          {/* Desktop menu */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            <Link
              href="/"
              className={`px-3 py-2 rounded-md text-sm transition-colors duration-150 ${
                isActive('/')
                  ? 'bg-blue-500 text-white dark:bg-blue-600 dark:text-white font-semibold shadow-sm' // Výraznější aktivní odkaz
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-slate-700 font-medium'
              }`}
              onClick={closeMenu}
            >
              {t('navbar.home', 'Domů')}
            </Link>
            <Link
              href="/chat"
              className={`px-3 py-2 rounded-md text-sm transition-colors duration-150 ${
                isActive('/chat')
                  ? 'bg-blue-500 text-white dark:bg-blue-600 dark:text-white font-semibold shadow-sm'
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-slate-700 font-medium'
              }`}
              onClick={closeMenu}
            >
              {t('navbar.chat', 'Chat')}
            </Link>
            <Link
              href="/diary"
              className={`px-3 py-2 rounded-md text-sm transition-colors duration-150 ${
                isActive('/diary')
                  ? 'bg-blue-500 text-white dark:bg-blue-600 dark:text-white font-semibold shadow-sm'
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-slate-700 font-medium'
              }`}
              onClick={closeMenu}
            >
              {t('navbar.diary', 'Deník')}
            </Link>
            <Link
              href="/gdpr"
              className={`px-3 py-2 rounded-md text-sm transition-colors duration-150 ${
                isActive('/gdpr')
                  ? 'bg-blue-500 text-white dark:bg-blue-600 dark:text-white font-semibold shadow-sm'
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-slate-700 font-medium'
              }`}
              onClick={closeMenu}
            >
              {t('navbar.gdpr', 'GDPR')}
            </Link>
            <Link
              href="/pricing"
              className={`px-3 py-2 rounded-md text-sm transition-colors duration-150 ${
                isActive('/pricing')
                  ? 'bg-blue-500 text-white dark:bg-blue-600 dark:text-white font-semibold shadow-sm'
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-slate-700 font-medium'
              }`}
              onClick={closeMenu}
            >
              {t('navbar.pricing', 'Ceník')}
            </Link>
            <Link
              href="/kontakt"
              className={`px-3 py-2 rounded-md text-sm transition-colors duration-150 ${
                isActive('/kontakt')
                  ? 'bg-blue-500 text-white dark:bg-blue-600 dark:text-white font-semibold shadow-sm'
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-slate-700 font-medium'
              }`}
              onClick={closeMenu}
            >
              {t('navbar.contact', 'Kontakt')}
            </Link>
            
            {/* Authentication UI */}
            {loading ? (
              <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
            ) : session ? (
              <div className="relative ml-3" ref={profileMenuRef}>
                <button
                  onClick={toggleProfileMenu}
                  className="flex items-center text-sm rounded-full focus:outline-none"
                  aria-expanded={isProfileMenuOpen}
                  aria-haspopup="true"
                >
                  <span className="sr-only">{t('navbar.userMenu.open', 'Otevřít uživatelské menu')}</span>
                  {session.user?.image ? (
                    <img
                      className="h-8 w-8 rounded-full"
                      src={session.user.image}
                      alt={session.user.name || t('navbar.userMenu.profilePicture', 'Profilový obrázek')}
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
                      <FaUserCircle size={24} />
                    </div>
                  )}
                  <span className="ml-2 text-gray-700 dark:text-gray-100 font-medium">
                    {session.user?.name?.split(' ')[0] || t('navbar.userMenu.user', 'Uživatel')}
                  </span>
                </button>
                
                {isProfileMenuOpen && (
                  <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg py-1 bg-white dark:bg-slate-800 ring-1 ring-black ring-opacity-5 z-20">
                    <div className="px-4 py-3 text-sm text-gray-700 dark:text-gray-100 border-b border-gray-200 dark:border-slate-700">
                      <p className="font-semibold">{session.user?.name}</p>
                      <p className="text-gray-500 dark:text-gray-400 truncate">{session.user?.email}</p>
                    </div>
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      <div className="flex items-center">
                        <FaUser className="mr-2" />
                        {t('navbar.userMenu.myProfile', 'Můj profil')}
                      </div>
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700"
                    >
                      <div className="flex items-center">
                        <FaSignOutAlt className="mr-2" />
                        {t('navbar.userMenu.signOut', 'Odhlásit se')}
                      </div>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2 ml-3">
                <Link
                  href="/auth/login"
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-slate-700"
                >
                  {t('navbar.signIn', 'Přihlásit')}
                </Link>
                <Link
                  href="/auth/register"
                  className="px-3 py-2 rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                >
                  {t('navbar.register', 'Registrovat')}
                </Link>
              </div>
            )}
            
            {/* Theme toggle button - ODSTRANĚNO */}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            {/* Theme toggle button - ODSTRANĚNO */}
            
            {/* Authentication UI for mobile */}
            {!loading && session && (
              <button
                onClick={toggleProfileMenu}
                className="p-2 rounded-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mr-2"
              >
                {session.user?.image ? (
                  <img
                    className="h-8 w-8 rounded-full"
                    src={session.user.image}
                    alt={session.user.name || "Profilový obrázek"}
                  />
                ) : (
                  <FaUserCircle size={24} />
                )}
              </button>
            )}
            
            {/* Menu toggle button */}
            <button
              onClick={toggleMenu}
              className="p-2 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white dark:bg-gray-800 shadow-lg"> {/* Upravena barva pozadí */}
            <Link 
              href="/" 
              className={`block px-3 py-2 rounded-md text-base ${
                isActive('/') 
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-700 dark:text-white font-semibold' 
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 font-medium'
              }`}
              onClick={closeMenu}
            >
              {t('navbar.home', 'Domů')}
            </Link>
            <Link 
              href="/chat" 
              className={`block px-3 py-2 rounded-md text-base ${
                isActive('/chat') 
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-700 dark:text-white font-semibold' 
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 font-medium'
              }`}
              onClick={closeMenu}
            >
              {t('navbar.chat', 'Chat')}
            </Link>
            <Link 
              href="/diary" 
              className={`block px-3 py-2 rounded-md text-base ${
                isActive('/diary') 
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-700 dark:text-white font-semibold' 
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 font-medium'
              }`}
              onClick={closeMenu}
            >
              {t('navbar.diary', 'Deník')}
            </Link>
            <Link 
              href="/gdpr" 
              className={`block px-3 py-2 rounded-md text-base ${
                isActive('/gdpr') 
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-700 dark:text-white font-semibold' 
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 font-medium'
              }`}
              onClick={closeMenu}
            >
              {t('navbar.gdpr', 'GDPR')}
            </Link>
            <Link 
              href="/pricing" 
              className={`block px-3 py-2 rounded-md text-base ${
                isActive('/pricing') 
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-700 dark:text-white font-semibold' 
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 font-medium'
              }`}
              onClick={closeMenu}
            >
              {t('navbar.pricing', 'Ceník')}
            </Link>
            <Link 
              href="/kontakt" 
              className={`block px-3 py-2 rounded-md text-base ${
                isActive('/kontakt') 
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-700 dark:text-white font-semibold' 
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 font-medium'
              }`}
              onClick={closeMenu}
            >
              {t('navbar.contact', 'Kontakt')}
            </Link>
            
            {/* Authentication links for mobile */}
            {!loading && !session && (
              <>
                <Link 
                  href="/auth/login" 
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                  onClick={closeMenu}
                >
                  {t('navbar.signIn', 'Přihlásit')}
                </Link>
                <Link 
                  href="/auth/register" 
                  className="block px-3 py-2 rounded-md text-base font-medium bg-blue-600 text-white hover:bg-blue-700"
                  onClick={closeMenu}
                >
                  {t('navbar.register', 'Registrovat')}
                </Link>
              </>
            )}
            
            {/* User profile for mobile */}
            {!loading && session && (
              <>
                <div className="px-3 py-2 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center">
                    {session.user?.image ? (
                      <img
                        className="h-8 w-8 rounded-full mr-2"
                        src={session.user.image}
                        alt={session.user.name || "Profilový obrázek"}
                      />
                    ) : (
                      <FaUserCircle size={24} className="mr-2" />
                    )}
                    <div>
                      <p className="text-base font-medium text-gray-700 dark:text-gray-300">{session.user?.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{session.user?.email}</p>
                    </div>
                  </div>
                </div>
                <Link 
                  href="/profile" 
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                  onClick={() => setIsProfileMenuOpen(false)}
                >
                  <div className="flex items-center">
                    <FaUser className="mr-2" />
                    {t('navbar.userMenu.myProfile', 'Můj profil')}
                  </div>
                </Link>
                <button 
                  onClick={handleSignOut}
                  className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  <div className="flex items-center">
                    <FaSignOutAlt className="mr-2" />
                    {t('navbar.userMenu.signOut', 'Odhlásit se')}
                  </div>
                </button>
              </>
            )}
          </div>
        </div>
      )}
      
      {/* Mobile profile menu */}
      {isProfileMenuOpen && !isMenuOpen && (
        <div className="md:hidden absolute right-0 left-0 z-10">
          <div className="px-2 pt-2 pb-3 mx-4 mt-2 rounded-md bg-white dark:bg-gray-800 shadow-lg">
            <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                {session?.user?.image ? (
                  <img
                    className="h-8 w-8 rounded-full mr-2"
                    src={session.user.image}
                    alt={session.user.name || "Profilový obrázek"}
                  />
                ) : (
                  <FaUserCircle size={24} className="mr-2" />
                )}
                <div>
                  <p className="text-base font-medium text-gray-700 dark:text-gray-300">{session?.user?.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{session?.user?.email}</p>
                </div>
              </div>
            </div>
            <Link 
              href="/profile" 
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
              onClick={() => setIsProfileMenuOpen(false)}
            >
              <div className="flex items-center">
                <FaUser className="mr-2" />
                Můj profil
              </div>
            </Link>
            <button 
              onClick={handleSignOut}
              className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              <div className="flex items-center">
                <FaSignOutAlt className="mr-2" />
                Odhlásit se
              </div>
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
