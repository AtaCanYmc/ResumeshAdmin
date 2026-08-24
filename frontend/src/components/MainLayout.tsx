import React, { useState, useEffect, useRef, Suspense } from 'react';
import { Outlet, NavLink, Link, useLocation } from 'react-router-dom';
import { User, Briefcase, FolderGit, BookOpen, Award, Menu, X, Moon, Sun, GraduationCap, Wand2 } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import SearchBar from './SearchBar';
import { useTheme } from '../context/ThemeContext';
import FocusTrap from 'focus-trap-react';
import PageLoader from './PageLoader';
import LanguageSwitcher from './LanguageSwitcher';
import { useTranslation } from 'react-i18next';
import Footer from './Footer';
import { useContentConfig } from '../hooks/useHomeData';

const MainLayout: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDesktopMenuCollapsed, setIsDesktopMenuCollapsed] = useState(true);
  const location = useLocation();
  const { theme, setTheme } = useTheme();
  const mainRef = useRef<HTMLElement>(null);
  const { t, i18n } = useTranslation();
  const { data: config } = useContentConfig(i18n.language);

  // Scroll Restoration on route change
  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [location.pathname]);

  const toggleTheme = () => {
    if (theme === 'dark') setTheme('light');
    else if (theme === 'light') setTheme('dark');
    else {
      const isSystemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(isSystemDark ? 'light' : 'dark');
    }
  };

  const navItems = [
    { path: '/', label: t('nav.about'), icon: <User size={20} aria-hidden="true" /> },
    { path: '/experiences', label: t('nav.experiences'), icon: <Briefcase size={20} aria-hidden="true" /> },
    { path: '/educations', label: t('nav.educations'), icon: <GraduationCap size={20} aria-hidden="true" /> },
    { path: '/skills', label: t('nav.skills'), icon: <Wand2 size={20} aria-hidden="true" /> },
    { path: '/projects', label: t('nav.projects'), icon: <FolderGit size={20} aria-hidden="true" /> },
    { path: '/articles', label: t('nav.articles'), icon: <BookOpen size={20} aria-hidden="true" /> },
    { path: '/certificates', label: t('nav.certificates'), icon: <Award size={20} aria-hidden="true" /> },
  ];

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  // Extracted Sidebar content allowing unique layoutId suffix to prevent framer-motion collisions
  const SidebarContent = ({ isMobile = false, isCollapsed = false }: { isMobile?: boolean, isCollapsed?: boolean }) => (
    <>
      <div className={`p-6 flex flex-col ${isCollapsed ? 'items-center justify-center' : 'items-start justify-between'}`}>
        <div className="flex items-center justify-between w-full">
          {!isCollapsed && (
            <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-blue-400 dark:to-indigo-500 bg-clip-text text-transparent truncate">
              ResuMesh
            </h1>
          )}
          {isCollapsed && (
            <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-blue-400 dark:to-indigo-500 bg-clip-text text-transparent">
              R
            </h1>
          )}
          {isMobile && (
            <button
              onClick={closeMobileMenu}
              className="md:hidden text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-md p-2 -mr-2"
              aria-label="Menüyü Kapat"
            >
              <X size={24} aria-hidden="true" />
            </button>
          )}
        </div>
        {!isCollapsed && config?.hero?.fullName && (
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 mt-1.5 tracking-wide truncate max-w-full">
            {config.hero.fullName}
          </span>
        )}
      </div>
      <nav className={`flex-1 space-y-2 mt-4 relative ${isCollapsed ? 'px-2' : 'px-4'}`}>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));

          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={closeMobileMenu}
              className={`flex items-center ${isCollapsed ? 'justify-center p-3' : 'space-x-3 px-4 py-3'} rounded-lg transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 relative z-10 ${
                isActive
                  ? 'text-blue-700 dark:text-blue-400'
                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
              }`}
              title={isCollapsed ? item.label : undefined}
            >
              {isActive && (
                <motion.div
                  layoutId={`activeTab-${isMobile ? 'mobile' : 'desktop'}`}
                  className="absolute inset-0 bg-blue-100 border border-blue-200 dark:bg-blue-600/20 dark:border-blue-600/30 rounded-lg -z-10"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              {item.icon}
              {!isCollapsed && <span className="font-medium truncate">{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Desktop Collapse Toggle */}
      {!isMobile && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-800 flex justify-center">
          <button
            onClick={() => setIsDesktopMenuCollapsed(!isCollapsed)}
            className="p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            aria-label={isCollapsed ? "Menüyü Genişlet" : "Menüyü Daralt"}
            title={isCollapsed ? "Menüyü Genişlet" : "Menüyü Daralt"}
          >
            <Menu size={20} aria-hidden="true" />
          </button>
        </div>
      )}
    </>
  );

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-white overflow-hidden transition-colors duration-300">
      {/* Desktop Sidebar */}
      <motion.aside
        animate={{ width: isDesktopMenuCollapsed ? 80 : 256 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="hidden md:flex bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex-col z-20 overflow-hidden no-print"
      >
        <SidebarContent isMobile={false} isCollapsed={isDesktopMenuCollapsed} />
      </motion.aside>

      {/* Mobile Sidebar (Drawer) */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <FocusTrap focusTrapOptions={{ clickOutsideDeactivates: true, onDeactivate: closeMobileMenu }}>
            <div className="fixed inset-0 z-50 md:hidden no-print">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={closeMobileMenu}
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                aria-hidden="true"
              />
              <motion.aside
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
                className="absolute inset-y-0 left-0 w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col shadow-2xl"
              >
                <SidebarContent isMobile={true} />
              </motion.aside>
            </div>
          </FocusTrap>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Topbar */}
        <header className="h-20 bg-glass flex items-center justify-between px-4 sm:px-8 sticky top-0 z-30 no-print">
          <div className="flex items-center flex-1 min-w-0">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden mr-2 sm:mr-4 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-md p-3"
              aria-label="Menüyü Aç"
            >
              <Menu size={24} aria-hidden="true" />
            </button>
            <div className="flex-1 max-w-2xl">
              <SearchBar />
            </div>
          </div>
          <div className="ml-4 flex items-center flex-shrink-0 space-x-1 sm:space-x-2">
            <LanguageSwitcher />
            <button
              onClick={toggleTheme}
              className="p-3 text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              aria-label="Temayı Değiştir"
              title="Temayı Değiştir"
            >
              {theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches) ? (
                <Sun size={20} aria-hidden="true" />
              ) : (
                <Moon size={20} aria-hidden="true" />
              )}
            </button>

          </div>
        </header>

        {/* Dynamic Page Content with Animations */}
        <main ref={mainRef} className="flex-1 overflow-y-auto relative flex flex-col">
          <div className="flex-1 p-4 sm:p-8">
            <div className="max-w-6xl mx-auto h-full">
              <AnimatePresence mode="wait">
                <motion.div
                  key={location.pathname}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="h-full"
                >
                  <Suspense fallback={<PageLoader />}>
                    <Outlet />
                  </Suspense>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
          <div className="no-print">
            <Footer />
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
