import React, { useState, useEffect, useRef } from 'react';
import { Search, Loader2, FolderGit, Briefcase, BookOpen, Award, ExternalLink, X } from 'lucide-react';
import { useDebounce } from '../hooks/useDebounce';
import { GlobalSearchResponse, SearchResultItem } from '../types';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useEnv } from '../hooks/useEnv';

export default function SearchBar() {
  const env = useEnv();
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);
  const [results, setResults] = useState<GlobalSearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isMobileExpanded, setIsMobileExpanded] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults(null);
      setIsOpen(false);
      return;
    }

    const fetchResults = async () => {
      setLoading(true);
      try {
        const response = await axios.get<GlobalSearchResponse>(
          `${env.API_URL}/api/v1/search/`,
          { params: { q: debouncedQuery } }
        );
        setResults(response.data);
        setIsOpen(true);
      } catch (error) {
        console.error('Search failed:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [debouncedQuery]);

  // Handle clicking outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setIsMobileExpanded(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMobileExpand = () => {
    setIsMobileExpanded(true);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  const renderSection = (title: string, items: SearchResultItem[], icon: React.ReactNode, linkPrefix: string) => {
    if (!items || items.length === 0) return null;
    return (
      <div className="mb-4 last:mb-0">
        <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2 px-3">
          {icon}
          {title}
        </h3>
        <ul className="space-y-1">
          {items.map((item) => (
            <li key={item.id}>
              {item.url ? (
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setIsMobileExpanded(false)}
                  className="flex flex-col px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg group transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  <div className="flex justify-between items-start">
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-400">{item.title}</span>
                    <ExternalLink size={14} className="text-gray-500 dark:text-gray-600 group-hover:text-blue-600 dark:group-hover:text-blue-400" aria-hidden="true" />
                  </div>
                  {item.subtitle && <span className="text-xs text-gray-500 line-clamp-1">{item.subtitle}</span>}
                </a>
              ) : (
                <Link
                  to={linkPrefix}
                  onClick={() => { setIsOpen(false); setIsMobileExpanded(false); }}
                  className="flex flex-col px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg group transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-400">{item.title}</span>
                  {item.subtitle && <span className="text-xs text-gray-500 line-clamp-1">{item.subtitle}</span>}
                </Link>
              )}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  const hasResults = results && (
    results.projects.length > 0 ||
    results.experiences.length > 0 ||
    results.articles.length > 0 ||
    results.certificates.length > 0
  );

  return (
    <div ref={searchRef} className="relative w-full flex justify-end md:block">

      {/* Mobile Search Icon (only visible when not expanded) */}
      {!isMobileExpanded && (
        <button
          className="md:hidden p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          onClick={handleMobileExpand}
          aria-label={t('search.open')}
        >
          <Search size={20} aria-hidden="true" />
        </button>
      )}

      {/* Search Input Container */}
      <div className={`
        absolute right-0 top-1/2 -translate-y-1/2 w-full md:relative md:translate-y-0
        ${isMobileExpanded ? 'block' : 'hidden md:block'}
      `}>
        <div className="relative flex items-center bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl focus-within:border-blue-500 dark:focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 shadow-sm transition-all">
          <Search className="absolute left-4 text-gray-400 dark:text-gray-500 w-5 h-5 pointer-events-none" aria-hidden="true" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
               setQuery(e.target.value);
               if (e.target.value.trim() && results) setIsOpen(true);
            }}
            onFocus={() => { if (query.trim() && results) setIsOpen(true); }}
            placeholder={t('search.placeholder')}
            className="w-full bg-transparent pl-12 pr-16 py-2.5 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none text-sm rounded-xl"
            aria-label={t('search.placeholder')}
          />

          <div className="absolute right-3 flex items-center space-x-2">
            {loading && (
              <Loader2 className="w-4 h-4 text-blue-500 animate-spin" aria-hidden="true" />
            )}
            {query && (
               <button
                 type="button"
                 className="text-gray-400 hover:text-gray-900 dark:hover:text-white focus:outline-none rounded-full p-1 focus-visible:ring-2 focus-visible:ring-blue-500"
                 onClick={() => { setQuery(''); setIsOpen(false); inputRef.current?.focus(); }}
                 aria-label={t('search.clear')}
               >
                 <X size={16} aria-hidden="true" />
               </button>
            )}
            {isMobileExpanded && !query && (
               <button
                 className="md:hidden text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white p-1"
                 onClick={() => { setIsMobileExpanded(false); setIsOpen(false); }}
                 aria-label={t('search.close')}
               >
                 <X size={16} aria-hidden="true" />
               </button>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (query.trim() !== '') && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-3 md:mt-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-2xl overflow-hidden z-50 max-h-[70vh] overflow-y-auto"
          >
            <div className="p-2">
              {!loading && !hasResults && (
                 <div className="p-8 flex flex-col items-center justify-center text-center">
                   <Search size={32} className="text-gray-300 dark:text-gray-700 mb-3" aria-hidden="true" />
                   <p className="text-sm font-medium text-gray-900 dark:text-white">{t('search.noResultsTitle')}</p>
                   <p className="text-xs text-gray-500 mt-1">{t('search.noResultsDesc')}</p>
                 </div>
              )}

              {results && hasResults && (
                <>
                  {renderSection(t('search.projects'), results.projects, <FolderGit size={14} aria-hidden="true" />, "/projects")}
                  {renderSection(t('search.experiences'), results.experiences, <Briefcase size={14} aria-hidden="true" />, "/experiences")}
                  {renderSection(t('search.articles'), results.articles, <BookOpen size={14} aria-hidden="true" />, "/articles")}
                  {renderSection(t('search.certificates'), results.certificates, <Award size={14} aria-hidden="true" />, "/certificates")}
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
