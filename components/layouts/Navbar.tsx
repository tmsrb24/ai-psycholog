import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useSession, signOut } from 'next-auth/react';
import { FaBars, FaTimes, FaUser, FaSignOutAlt, FaUserCircle, FaGlobe } from 'react-icons/fa';
import { useTheme } from '../ui/ThemeProvider';
import ThemeToggleButton from '../ui/ThemeToggleButton';
import { useTranslation } from 'next-i18next';

const Navbar: React.FC = () => {
  const { t, i18n } = useTranslation('common');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { theme } = useTheme();
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

  const navClasses = `sticky top-0 z-50 backdrop-blur-lg transition-all duration-300 ${
    isScrolled
      ? 'bg-background-light/80 dark:bg-background-dark/80 shadow-md'
      : 'bg-transparent shadow-none'
  }`;

  const linkClasses = (path: string) => `px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
    isActive(path)
      ? 'bg-primary-light/20 text-primary-light dark:bg-primary-dark/20 dark:text-primary-dark'
      : 'text-text-light/80 hover:text-text-light dark:text-text-dark/80 dark:hover:text-text-dark hover:bg-black/5 dark:hover:bg-white/5'
  }`;

  const mobileLinkClasses = (path: string) => `block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
    isActive(path)
      ? 'bg-primary-light/20 text-primary-light dark:bg-primary-dark/20 dark:text-primary-dark'
      : 'text-text-light hover:bg-gray-100 dark:text-text-dark dark:hover:bg-gray-700'
  }`;

  return (
    <nav className={navClasses}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center space-x-3" onClick={closeMenu}>
              <Image
                src="/images/hero-avatar.png"
                alt={t('appName', 'Psychollog Logo')}
                width={32}
                height={32}
                className="h-8 w-auto rounded-full"
              />
              <span className="font-bold text-xl text-text-light dark:text-text-dark">Psychollog</span>
            </Link>
          </div>

          {/* Desktop menu */}
          <div className="hidden md:flex md:items-center md:space-x-2">
            <Link href="/" className={linkClasses('/')} onClick={closeMenu}>{t('navbar.home', 'Domů')}</Link>
            <Link href="/chat" className={linkClasses('/chat')} onClick={closeMenu}>{t('navbar.chat', 'Chat')}</Link>
            <Link href="/diary" className={linkClasses('/diary')} onClick={closeMenu}>{t('navbar.diary', 'Deník')}</Link>
            <Link href="/pricing" className={linkClasses('/pricing')} onClick={closeMenu}>{t('navbar.pricing', 'Ceník')}</Link>
            <Link href="/blog" className={linkClasses('/blog')} onClick={closeMenu}>Blog</Link>
            
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
                    <div className="h-8 w-8 rounded-full bg-primary-light dark:bg-primary-dark flex items-center justify-center text-white">
                      <FaUserCircle size={24} />
                    </div>
                  )}
                </button>
                
                {isProfileMenuOpen && (
                  <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg py-1 bg-background-light dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-20">
                    <div className="px-4 py-3 text-sm text-text-light dark:text-text-dark border-b border-gray-200 dark:border-gray-700">
                      <p className="font-semibold">{session.user?.name}</p>
                      <p className="text-gray-500 dark:text-gray-400 truncate">{session.user?.email}</p>
                    </div>
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-sm text-text-light dark:text-text-dark hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      <div className="flex items-center">
                        <FaUser className="mr-2" />
                        {t('navbar.userMenu.myProfile', 'Můj profil')}
                      </div>
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left block px-4 py-2 text-sm text-text-light dark:text-text-dark hover:bg-gray-100 dark:hover:bg-gray-700"
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
                <Link href="/auth/login" className="btn btn-secondary">{t('navbar.signIn', 'Přihlásit')}</Link>
                <Link href="/auth/register" className="btn btn-primary">{t('navbar.register', 'Registrovat')}</Link>
              </div>
            )}
            
            <div className="relative ml-3" ref={langMenuRef}>
              <button
                onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                className="flex items-center p-2 rounded-md text-sm font-medium text-text-light/80 hover:text-text-light dark:text-text-dark/80 dark:hover:text-text-dark hover:bg-black/5 dark:hover:bg-white/5"
                aria-expanded={isLangMenuOpen}
                aria-haspopup="true"
              >
                <FaGlobe className="mr-2" />
                {router.locale?.toUpperCase()}
              </button>
              {isLangMenuOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-40 rounded-md shadow-lg py-1 bg-background-light dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-20">
                  {(router.locales || []).map((locale) => (
                    <button
                      key={locale}
                      onClick={() => changeLanguage(locale)}
                      className={`w-full text-left block px-4 py-2 text-sm flex items-center
                        ${router.locale === locale
                          ? 'bg-primary-light/20 text-primary-light dark:bg-primary-dark/20 dark:text-primary-dark'
                          : 'text-text-light hover:bg-gray-100 dark:text-text-dark dark:hover:bg-gray-700'
                        }`}
                    >
                      <span className="mr-2 text-lg">{languageFlags[locale]}</span>
                      {t(`languages.${locale}`, locale.toUpperCase())}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <ThemeToggleButton />
          </div>

          <div className="flex items-center md:hidden">
            <ThemeToggleButton />
            <button
              onClick={toggleMenu}
              className="p-2 rounded-md text-text-light dark:text-text-dark"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-background-light dark:bg-gray-800 shadow-lg">
            <Link href="/" className={mobileLinkClasses('/')} onClick={closeMenu}>{t('navbar.home', 'Domů')}</Link>
            <Link href="/chat" className={mobileLinkClasses('/chat')} onClick={closeMenu}>{t('navbar.chat', 'Chat')}</Link>
            <Link href="/diary" className={mobileLinkClasses('/diary')} onClick={closeMenu}>{t('navbar.diary', 'Deník')}</Link>
            <Link href="/pricing" className={mobileLinkClasses('/pricing')} onClick={closeMenu}>{t('navbar.pricing', 'Ceník')}</Link>
            <Link href="/blog" className={mobileLinkClasses('/blog')} onClick={closeMenu}>Blog</Link>
            
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
              {!loading && !session && (
                <div className="flex items-center justify-center space-x-2">
                  <Link href="/auth/login" className="btn btn-secondary w-full" onClick={closeMenu}>{t('navbar.signIn', 'Přihlásit')}</Link>
                  <Link href="/auth/register" className="btn btn-primary w-full" onClick={closeMenu}>{t('navbar.register', 'Registrovat')}</Link>
                </div>
              )}
              
              {!loading && session && (
                <div className="space-y-1">
                  <div className="px-3 py-2">
                    <div className="flex items-center">
                      {session.user?.image ? (
                        <img className="h-10 w-10 rounded-full mr-3" src={session.user.image} alt="" />
                      ) : (
                        <FaUserCircle size={24} className="mr-3" />
                      )}
                      <div>
                        <p className="text-base font-medium text-text-light dark:text-text-dark">{session.user?.name}</p>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{session.user?.email}</p>
                      </div>
                    </div>
                  </div>
                  <Link href="/profile" className={mobileLinkClasses('/profile')} onClick={closeMenu}>
                    <div className="flex items-center"><FaUser className="mr-2" />{t('navbar.userMenu.myProfile', 'Můj profil')}</div>
                  </Link>
                  <button onClick={() => { handleSignOut(); closeMenu(); }} className={`${mobileLinkClasses('')} w-full text-left`}>
                    <div className="flex items-center"><FaSignOutAlt className="mr-2" />{t('navbar.userMenu.signOut', 'Odhlásit se')}</div>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
