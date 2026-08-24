import React from 'react';
import { ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import SpotlightCard from '../ui/SpotlightCard';
import { useProjects } from '../../hooks/useHomeData';
import { ProjectsSkeleton } from '../ui/Skeletons';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

const FeaturedProjects: React.FC = () => {
  const { t } = useTranslation();
  const { data: projects, isLoading } = useProjects(6);

  if (isLoading) return <ProjectsSkeleton />;
  if (!projects || projects.length === 0) return null;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      className="pt-8"
    >
      <div className="mb-12 text-center max-w-2xl mx-auto">
        <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
          <span className="bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-blue-400 dark:to-indigo-500 bg-clip-text text-transparent">
            {t('home.featuredProjects')}
          </span>
        </h2>
        <p className="mt-3 text-lg text-gray-500 dark:text-gray-400">
          {t('projects.subtitle')}
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project: any) => {

          const getSpotlightColor = (color?: string) => {
            switch(color) {
              case 'blue': return 'rgba(59, 130, 246, 0.15)';
              case 'indigo': return 'rgba(99, 102, 241, 0.15)';
              case 'purple': return 'rgba(168, 85, 247, 0.15)';
              default: return 'rgba(156, 163, 175, 0.15)';
            }
          };

          return (
            <motion.div variants={itemVariants} key={project.id} className="h-full">
              <SpotlightCard spotlightColor={getSpotlightColor(project.color)} className="h-full">
                <a
                  href={project.url || project.url || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex h-full flex-col rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-colors hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-gray-800 dark:bg-gray-900"
                  aria-label={`${project.title} projesine git`}
                >
                  <div className="mb-4 flex items-start justify-between">
                    <div className="text-lg font-bold text-gray-900 transition-colors group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
                      {project.title}
                    </div>
                    <ExternalLink
                      size={18}
                      className="text-gray-400 transition-colors group-hover:text-blue-500"
                      aria-hidden="true"
                    />
                  </div>
                  <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                    {project.description}
                  </p>
                </a>
              </SpotlightCard>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default FeaturedProjects;
