import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useSession, signOut } from 'next-auth/react';
import { FaBars, FaTimes, FaUser, FaSignOutAlt, FaUserCircle, FaGlobe } from 'react-icons/fa';
import { useTheme } from './ThemeProvider';
import { useTranslation } from 'next-i18next';

const Navbar: React.FC = () => {
  const { t, i18n } = useTranslation('common');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false); // State for scroll effect
  // const { theme } = useTheme(); // theme is not used, can be removed if not planned for future
  const router = useRouter();
  const { data: session, status } = useSession();
  const loading = status === "loading";
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const langMenuRef = useRef<HTMLDivElement>(null);

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
    console.log("Attempting to sign out...");
    try {
      await signOut(); 
      console.log("Sign out successful (or at least initiated).");
    } catch (error) {
      console.error("Error during sign out:", error);
    }
  };

  const isActive = (path: string) => {
    return router.pathname === path;
  };

  // Effect for scroll handling
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    // Call handler once on mount to set initial state
    handleScroll(); 

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
        setIsLangMenuOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside, true);
    return () => {
      document.removeEventListener('click', handleClickOutside, true);
    };
  }, []);

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    router.push(router.pathname, router.asPath, { locale: lng });
    setIsLangMenuOpen(false);
  };

  const languageFlags: { [key: string]: string } = {
    cs: '🇨🇿',
    en: '🇬🇧',
    uk: '🇺🇦',
  };

  const navClasses = `sticky top-0 z-50 backdrop-blur-md transition-all duration-300 ${
    isScrolled 
      ? 'bg-white/95 dark:bg-slate-900/95 shadow-lg' 
      : 'bg-white/70 dark:bg-slate-900/70 shadow-none'
  }`;

  return (
    <nav className={navClasses}> 
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center space-x-2" onClick={closeMenu}>
              <Image
                src="/images/hero-avatar.png"
                alt={t('appName', 'Psychollog Logo')}
                width={32}
                height={32}
                className="h-8 w-auto" 
              />
              <span className="font-bold text-xl text-gray-800 dark:text-white">Psychollog</span>
            </Link>
          </div>

          {/* Desktop menu */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            <Link
              href="/"
              className={`px-3 py-2 rounded-md text-sm transition-colors duration-150 ${
                isActive('/')
                  ? 'bg-blue-500 text-white dark:bg-blue-600 dark:text-white font-semibold shadow-sm'
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
            {/* ... other nav links ... */}
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
            
            <div className="relative ml-3" ref={langMenuRef}>
              <button
                onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                className="flex items-center p-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-slate-700"
                aria-expanded={isLangMenuOpen}
                aria-haspopup="true"
              >
                <span className="mr-1 text-lg">{languageFlags[router.locale || 'cs']}</span>
                {router.locale?.toUpperCase()}
                <svg className={`ml-1 h-4 w-4 transform transition-transform ${isLangMenuOpen ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
              {isLangMenuOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-40 rounded-md shadow-lg py-1 bg-white dark:bg-slate-800 ring-1 ring-black ring-opacity-5 z-20">
                  {(router.locales || []).map((locale) => (
                    <button
                      key={locale}
                      onClick={() => changeLanguage(locale)}
                      className={`w-full text-left block px-4 py-2 text-sm flex items-center
                        ${router.locale === locale 
                          ? 'bg-blue-500 text-white dark:bg-blue-600' 
                          : 'text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-slate-700'
                        }`}
                    >
                      <span className="mr-2 text-lg">{languageFlags[locale]}</span> 
                      {t(`languages.${locale}`, locale.toUpperCase())}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center md:hidden">
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

      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white dark:bg-gray-800 shadow-lg">
            {/* Mobile nav links */}
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
            
            {!loading && session && (
              <>
                <div className="px-3 py-2 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center">
                    {session.user?.image ? (
                      <img
                        className="h-8 w-8 rounded-full mr-2"
                        src={session.user.image}
                        alt={session.user.name || t('navbar.userMenu.profilePicture', 'Profilový obrázek')}
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
                  onClick={() => { closeMenu(); setIsProfileMenuOpen(false); }}
                >
                  <div className="flex items-center">
                    <FaUser className="mr-2" />
                    {t('navbar.userMenu.myProfile', 'Můj profil')}
                  </div>
                </Link>
                <button 
                  onClick={() => { handleSignOut(); closeMenu(); }}
                  className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  <div className="flex items-center">
                    <FaSignOutAlt className="mr-2" />
                    {t('navbar.userMenu.signOut', 'Odhlásit se')}
                  </div>
                </button>
              </>
            )}
            <div className="px-3 py-3 border-t border-gray-200 dark:border-gray-700">
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 px-1">{t('navbar.language', 'Jazyk')}:</div>
              <div className="flex flex-col space-y-1">
                {(router.locales || []).map((locale) => (
                  <button
                    key={locale}
                    onClick={() => {
                      changeLanguage(locale); 
                      closeMenu();
                    }}
                    className={`w-full text-left block px-3 py-2 rounded-md text-base font-medium transition-colors flex items-center
                      ${router.locale === locale 
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-700 dark:text-white' 
                        : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                      }`}
                  >
                    <span className="mr-2 text-lg">{languageFlags[locale]}</span>
                    {t(`languages.${locale}`, locale.toUpperCase())}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      
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
