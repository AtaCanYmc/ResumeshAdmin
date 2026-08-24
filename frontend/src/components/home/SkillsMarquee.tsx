import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useSkills } from '../../hooks/useHomeData';
import { Skill } from '../../types';
import { getIcon } from '../../utils/iconResolver';

const getCategoryColor = (category: string) => {
  const cat = category.toLowerCase();
  if (cat.includes('front') || cat.includes('web') || cat.includes('design') || cat.includes('arayüz')) {
    return {
      bg: 'bg-blue-50 dark:bg-blue-950/30',
      text: 'text-blue-600 dark:text-blue-400',
      border: 'hover:border-blue-400 dark:hover:border-blue-700',
      glow: 'shadow-blue-500/10'
    };
  }
  if (cat.includes('back') || cat.includes('api') || cat.includes('server') || cat.includes('sunucu')) {
    return {
      bg: 'bg-emerald-50 dark:bg-emerald-950/30',
      text: 'text-emerald-600 dark:text-emerald-400',
      border: 'hover:border-emerald-400 dark:hover:border-emerald-700',
      glow: 'shadow-emerald-500/10'
    };
  }
  if (cat.includes('db') || cat.includes('data') || cat.includes('sql') || cat.includes('veri')) {
    return {
      bg: 'bg-purple-50 dark:bg-purple-950/30',
      text: 'text-purple-600 dark:text-purple-400',
      border: 'hover:border-purple-400 dark:hover:border-purple-700',
      glow: 'shadow-purple-500/10'
    };
  }
  if (cat.includes('cloud') || cat.includes('devops') || cat.includes('docker') || cat.includes('sistem')) {
    return {
      bg: 'bg-orange-50 dark:bg-orange-950/30',
      text: 'text-orange-600 dark:text-orange-400',
      border: 'hover:border-orange-400 dark:hover:border-orange-700',
      glow: 'shadow-orange-500/10'
    };
  }
  return {
    bg: 'bg-indigo-50 dark:bg-indigo-950/30',
    text: 'text-indigo-600 dark:text-indigo-400',
    border: 'hover:border-indigo-400 dark:hover:border-indigo-700',
    glow: 'shadow-indigo-500/10'
  };
};

export default function SkillsMarquee() {
  const { t, i18n } = useTranslation();
  const { data: skills, isLoading } = useSkills();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  if (isLoading || !skills || !Array.isArray(skills) || skills.length === 0) {
    return null;
  }

  // Extract unique categories dynamically
  const rawCategories = Array.from(new Set(skills.map((s) => s.category)));
  const categories = [
    { id: 'all', label: i18n.language === 'tr' ? 'Hepsi' : 'All' },
    ...rawCategories.map(cat => ({
      id: cat.toLowerCase(),
      label: cat.charAt(0).toUpperCase() + cat.slice(1)
    }))
  ];

  // Filter skills based on selected category
  const filteredSkills = selectedCategory === 'all'
    ? skills
    : skills.filter((s) => s.category.toLowerCase() === selectedCategory);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 200, damping: 20 } }
  };

  return (
    <div className="py-16 relative">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[40%] right-[5%] w-[30%] h-[30%] rounded-full bg-indigo-500/5 dark:bg-indigo-600/5 blur-[100px]" />
      </div>

      <div className="mb-10 text-center max-w-2xl mx-auto">
        <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
          <span className="bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-blue-400 dark:to-indigo-500 bg-clip-text text-transparent">
            {t('home.skills')}
          </span>
        </h2>
        <p className="mt-3 text-lg text-gray-500 dark:text-gray-400">
          {t('home.skillsSubtitle')}
        </p>
      </div>

      {/* Categories Selector Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
        {categories.map((cat) => {
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`
                px-5 py-2.5 rounded-xl font-medium text-sm transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 relative cursor-pointer
                ${isActive
                  ? 'text-white'
                  : 'text-gray-600 dark:text-gray-400 bg-white/50 dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-800'
                }
              `}
            >
              {isActive && (
                <motion.div
                  layoutId="activeCategory"
                  className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-indigo-500 rounded-xl"
                  transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                />
              )}
              <span className="relative z-10">{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Skills Grid */}
      <motion.div
        layout
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
      >
        <AnimatePresence mode="popLayout">
          {filteredSkills.map((skill) => {
            const colors = getCategoryColor(skill.category);
            const Icon = getIcon(skill.icon_name || 'code');

            return (
              <motion.div
                layout
                key={skill.id}
                variants={itemVariants}
                initial="hidden"
                animate="show"
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
                className={`
                  flex items-center gap-4 p-4 rounded-2xl bg-white/60 dark:bg-gray-900/60 backdrop-blur-md border border-gray-200 dark:border-gray-800/80 transition-all hover:-translate-y-1 hover:shadow-lg ${colors.glow} ${colors.border} group cursor-default
                `}
              >
                <div className={`p-3 rounded-xl ${colors.bg} ${colors.text} transition-colors group-hover:scale-110 duration-300`}>
                  <Icon size={24} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-base font-bold text-gray-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {skill.name}
                  </h4>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 truncate mt-0.5">
                    {skill.category.charAt(0).toUpperCase() + skill.category.slice(1)}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
