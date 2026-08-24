import React, { useState } from 'react';
import { Download, ArrowRight, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import MagneticButton from '../ui/MagneticButton';
import { useContentConfig } from '../../hooks/useHomeData';
import { HeroSkeleton } from '../ui/Skeletons';
import { getIcon } from '../../utils/iconResolver';
import { useDownloadResume } from '../../hooks/useDownloadResume';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2
    }
  }
};

const textVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.2, 0.65, 0.3, 0.9] } }
};

const HeroSection: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { data: config, isLoading } = useContentConfig(i18n.language);
  const { isDownloading, handleDownload } = useDownloadResume(config?.hero?.resumeLink);

  // 3D Tilt Effect State
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseXSpring = useSpring(x, { stiffness: 150, damping: 15 });
  const mouseYSpring = useSpring(y, { stiffness: 150, damping: 15 });
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["15deg", "-15deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-15deg", "15deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <div className="relative min-h-[60vh] flex items-center mb-20 mt-10">
      {/* Background Mesh/Glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-500/20 dark:bg-blue-600/20 blur-[120px] animate-pulse" />
        <div className="absolute top-[20%] -right-[10%] w-[40%] h-[40%] rounded-full bg-indigo-500/20 dark:bg-purple-600/20 blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="flex flex-col lg:flex-row items-center justify-between gap-12 w-full min-h-[400px]">
        {/* Left Content: Staggered Text Reveal */}
        {isLoading || !config ? (
          <HeroSkeleton />
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex-1 space-y-6 text-center lg:text-left z-10"
          >
            <motion.h1 variants={textVariants} className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tighter leading-tight text-gray-900 dark:text-white">
              {t('home.greeting')} <span className="bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">{config.hero.name}</span>.
            </motion.h1>
            <motion.div variants={textVariants} className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-800 dark:text-gray-200">
              {config.hero.title}
            </motion.div>
            <motion.p variants={textVariants} className="text-lg sm:text-xl font-medium text-gray-600 dark:text-gray-400 leading-relaxed max-w-2xl mx-auto lg:mx-0">
              {config.hero.description}
            </motion.p>

            <motion.div variants={textVariants} className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-6">
              <MagneticButton>
                <div className="relative group rounded-xl">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl blur opacity-60 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
                  <button
                    onClick={handleDownload}
                    disabled={isDownloading}
                    className="relative flex items-center justify-center gap-2 px-8 py-3.5 bg-blue-600 text-white font-semibold rounded-xl transition-all shadow-lg focus:outline-none disabled:opacity-80"
                    aria-label={t('hero.downloadResume')}
                  >
                    {isDownloading ? (
                      <Loader2 size={20} className="animate-spin" aria-hidden="true" />
                    ) : (
                      <Download size={20} aria-hidden="true" />
                    )}
                    <span>{isDownloading ? t('hero.downloadingResume') : t('hero.downloadResume')}</span>
                  </button>
                </div>
              </MagneticButton>

              <MagneticButton as="a" href="/projects">
                <Link
                  to="/projects"
                  className="flex items-center justify-center gap-2 px-8 py-3.5 bg-white/50 dark:bg-gray-800/50 backdrop-blur-md border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white font-medium rounded-xl transition-all hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500"
                  aria-label={t('hero.viewProjects')}
                >
                  <span>{t('hero.viewProjects')}</span>
                  <ArrowRight size={20} aria-hidden="true" />
                </Link>
              </MagneticButton>

              <div className="flex items-center gap-2 ml-0 sm:ml-4 mt-4 sm:mt-0">
                {config.socials.map((social: any) => {
                  const Icon = getIcon(social.icon || social.platform);
                  return (
                    <MagneticButton key={social.id} as="a" href={social.url}>
                      <div className="p-3 bg-white/50 dark:bg-gray-800/50 backdrop-blur-md border border-gray-200 dark:border-gray-700 rounded-xl text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white dark:hover:bg-gray-700 transition-colors shadow-sm cursor-pointer">
                        <Icon size={20} />
                      </div>
                    </MagneticButton>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Right Content: 3D Interactive Mockup/Avatar */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex-1 hidden lg:flex justify-center items-center perspective-[1000px]"
        >
          <motion.div
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
            className="relative w-[400px] h-[400px] rounded-3xl bg-gradient-to-tr from-blue-500/20 to-purple-500/20 border border-white/10 backdrop-blur-3xl shadow-2xl flex items-center justify-center cursor-crosshair"
          >
            {/* Inner Floating Element for Parallax */}
            <motion.div
              style={{ transform: "translateZ(50px)" }}
              className="text-center p-8 bg-white/10 dark:bg-black/20 backdrop-blur-md rounded-2xl border border-white/20 dark:border-white/10"
            >
              {config.hero.avatarImage || import.meta.env.VITE_GITHUB_USERNAME ? (
                <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden border-2 border-white/20 shadow-lg">
                  <img
                    src={
                      config.hero.avatarImage?.startsWith('http')
                        ? config.hero.avatarImage
                        : config.hero.avatarImage?.startsWith('/api/v1/avatar/')
                        ? `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}${config.hero.avatarImage}/url`
                        : config.hero.avatarImage?.startsWith('/')
                        ? `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}${config.hero.avatarImage}`
                        : config.hero.avatarImage ||
                          `https://github.com/${import.meta.env.VITE_GITHUB_USERNAME}.png`
                    }
                    alt={config.hero.fullName}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                  AY
                </div>
              )}
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">{config.hero.fullName || config.hero.name}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{config.hero.avatarSubtitle}</p>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default HeroSection;
