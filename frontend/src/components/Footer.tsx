import React, { useState } from 'react';
import { Mail, Heart, ChevronUp, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useContentConfig } from '../hooks/useHomeData';
import { getIcon } from '../utils/iconResolver';

const Footer: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { data: config } = useContentConfig(i18n.language);
  const [isExpanded, setIsExpanded] = useState(false);

  if (!config) return null;

  return (
    <footer className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-black/40 pt-8 pb-8 mt-24">
      <div className="container mx-auto px-4 max-w-6xl">
        <AnimatePresence initial={false}>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12 pt-4">
          {/* About Section */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span className="bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent">
                ResuMesh
              </span>
            </h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed max-w-md">
              <strong className="block mb-2 text-gray-800 dark:text-gray-200">{t('footer.aboutTitle')}</strong>
              {t('footer.aboutText')}
            </p>
          </div>

          {/* Connect Section */}
          <div className="md:text-right">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              {t('footer.connect')}
            </h3>
            <div className="flex flex-col md:items-end gap-4">
              <a
                href={`mailto:${config.footer.email}`}
                className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors w-fit"
              >
                <Mail size={18} />
                <span>{config.footer.email}</span>
              </a>

              <div className="flex items-center gap-4 mt-2">
                {config.socials.map((social) => {
                  const Icon = getIcon(social.icon || social.platform);
                  return (
                    <a
                      key={social.id}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-700 transition-all"
                      aria-label={social.label}
                    >
                      <Icon size={20} />
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
                </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom Bar */}
        <div className={`flex flex-col md:flex-row items-center justify-between transition-all duration-300 ${isExpanded ? 'pt-8 border-t border-gray-200 dark:border-gray-800' : ''} text-sm text-gray-500 dark:text-gray-500`}>
          <div className="flex items-center gap-4">
            <p>© {new Date().getFullYear()} {config.hero.name}. {t('footer.allRightsReserved')}</p>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 text-gray-600 dark:text-gray-400"
              aria-label={isExpanded ? "Daralt" : "Genişlet"}
              title={isExpanded ? "Daralt" : "Genişlet"}
            >
              {isExpanded ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
            </button>
          </div>
          <p className="flex items-center gap-1.5 mt-4 md:mt-0">
            {i18n.language === 'tr' ? (
              <>
                {config.hero.name} tarafından <Heart size={14} className="text-red-500 fill-red-500 animate-pulse" /> ile geliştirildi
              </>
            ) : (
              <>
                {t('footer.builtWith')} <Heart size={14} className="text-red-500 fill-red-500" /> {t('footer.by')} {config.hero.name}
              </>
            )}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
