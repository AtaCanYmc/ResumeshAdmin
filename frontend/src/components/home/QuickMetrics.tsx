import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useContentConfig } from '../../hooks/useHomeData';
import { MetricsSkeleton } from '../ui/Skeletons';
import { getIcon } from '../../utils/iconResolver';

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
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } }
};

const QuickMetrics: React.FC = () => {
  const { i18n } = useTranslation();
  const { data: config, isLoading } = useContentConfig(i18n.language);

  if (isLoading || !config) {
    return <MetricsSkeleton />;
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      className="grid grid-cols-1 md:grid-cols-4 gap-4 py-8"
    >
      {config.metrics.map((metric, index) => {
        const Icon = getIcon(metric.icon);
        const isFeatured = index === 0;

        const getBgClass = (color: string) => {
          switch(color) {
            case 'blue': return 'bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-500/20';
            case 'indigo': return 'bg-indigo-100 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/20';
            case 'purple': return 'bg-purple-100 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-500/20';
            default: return 'bg-gray-100 dark:bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-500/20';
          }
        };

        const iconBg = metric.color === 'blue' ? 'bg-blue-500 dark:bg-blue-500' :
                       metric.color === 'indigo' ? 'bg-indigo-500 dark:bg-indigo-500' :
                       'bg-purple-500 dark:bg-purple-500';

        // Bento grid spans
        const colSpanClass = index === 0 ? 'md:col-span-2 md:row-span-2' :
                             index === 1 ? 'md:col-span-2' :
                             index === 2 ? 'md:col-span-2' : 'md:col-span-1';

        return (
          <motion.div
            key={metric.id}
            variants={itemVariants}
            className={`group relative overflow-hidden bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 rounded-3xl flex flex-col justify-between transition-all hover:shadow-xl hover:-translate-y-1 ${colSpanClass}`}
          >
            {/* Background Gradient Blob */}
            <div className={`absolute -right-8 -top-8 w-32 h-32 rounded-full blur-3xl opacity-20 transition-opacity group-hover:opacity-40 ${iconBg}`} />

            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 shadow-sm border ${getBgClass(metric.color)}`}>
              <Icon size={24} aria-hidden="true" />
            </div>

            <div className="relative z-10 mt-auto">
              <div className={`text-4xl lg:text-5xl font-black mb-1 text-gray-900 dark:text-white`}>
                {metric.value}
              </div>
              <div className="text-sm lg:text-base text-gray-500 dark:text-gray-400 font-medium">
                {metric.label}
              </div>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
};

export default QuickMetrics;
