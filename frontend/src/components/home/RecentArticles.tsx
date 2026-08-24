import React from 'react';
import { ExternalLink, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import SpotlightCard from '../ui/SpotlightCard';
import { useArticles } from '../../hooks/useHomeData';
import { ArticlesSkeleton } from '../ui/Skeletons';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

export default function RecentArticles() {
  const { t } = useTranslation();
  const { data: articles, isLoading } = useArticles(6);

  if (isLoading) return <ArticlesSkeleton />;
  if (!articles || articles.length === 0) return null;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      className="pt-12"
    >
      <div className="mb-12 text-center max-w-2xl mx-auto">
        <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
          <span className="bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-blue-400 dark:to-indigo-500 bg-clip-text text-transparent">
            {t('home.recentArticles')}
          </span>
        </h2>
        <p className="mt-3 text-lg text-gray-500 dark:text-gray-400">
          {t('articles.subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {articles.map((article: any) => {
          const getSpotlightColor = (color?: string) => {
            switch(color) {
              case 'blue': return 'rgba(59, 130, 246, 0.15)';
              case 'indigo': return 'rgba(99, 102, 241, 0.15)';
              case 'purple': return 'rgba(168, 85, 247, 0.15)';
              default: return 'rgba(156, 163, 175, 0.15)';
            }
          };

          const PlatformLogo = () => {
            if (article.platform === 'Medium') {
              return (
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-black text-white text-xs font-bold rounded-md">
                  Medium
                </div>
              );
            }
            if (article.platform === 'Dev.to') {
              return (
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-900 text-white text-xs font-bold rounded-md">
                  DEV
                </div>
              );
            }
            return null;
          };

          return (
            <motion.div variants={itemVariants} key={article.id} className="h-full">
              <SpotlightCard spotlightColor={getSpotlightColor(article.color)} className="h-full">
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col h-full p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl transition-all hover:-translate-y-1 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                >
                  <div className="flex items-center justify-between mb-4">
                    <PlatformLogo />
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      {article.published_at ? new Date(article.published_at).toLocaleDateString() : ''}
                    </span>
                  </div>

                  <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-3 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
                    {article.title}
                  </h3>

                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-3 mb-6 flex-grow">
                    {article.summary || article.description}
                  </p>

                  <div className="flex items-center gap-2 text-sm font-semibold text-indigo-600 dark:text-indigo-400 mt-auto">
                    {t('home.readArticle')}
                    <ExternalLink size={14} className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                  </div>
                </a>
              </SpotlightCard>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
