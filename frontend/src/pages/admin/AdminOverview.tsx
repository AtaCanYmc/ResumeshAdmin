import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import {
  ArrowRight,
  Award,
  BookOpen,
  Box,
  Briefcase,
  FileCode2,
  FolderGit,
  GraduationCap,
  HardDrive,
  RefreshCw,
  Settings,
  Share2,
  ShieldAlert,
  Sparkles,
  UserCheck,
  Video,
  Wand2,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';

import AdminPageHeader from '../../components/admin/AdminPageHeader';
import { useAuth } from '../../context/AuthContext';
import { useEnv } from '../../hooks/useEnv';

interface NavModule {
  title: string;
  description: string;
  href: string;
  icon: React.ElementType;
  color: string;
  badge?: string;
}

export default function AdminOverview() {
  const { token } = useAuth();
  const { ADMIN_API_URL } = useEnv();
  const queryClient = useQueryClient();

  const refreshMutation = useMutation({
    mutationFn: async () => {
      await axios.post(
        `${ADMIN_API_URL}/api/v1/admin/refresh-data`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
    },
    onSuccess: () => {
      toast.success('Data successfully refreshed from platforms!');
      queryClient.invalidateQueries({ queryKey: ['admin-projects'] });
      queryClient.invalidateQueries({ queryKey: ['admin-experiences'] });
      queryClient.invalidateQueries({ queryKey: ['admin-articles'] });
      queryClient.invalidateQueries({ queryKey: ['admin-certificates'] });
      queryClient.invalidateQueries({ queryKey: ['admin-system-logs'] });
      queryClient.invalidateQueries({ queryKey: ['home-data'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to refresh data.');
    },
  });

  const contentModules: NavModule[] = [
    {
      title: 'Projects',
      description: 'Manage open source repositories, GitHub projects, and stars.',
      href: '/admin/projects',
      icon: FolderGit,
      color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800/50',
    },
    {
      title: 'Articles',
      description: 'Manage blog posts, Dev.to articles, and Medium publications.',
      href: '/admin/articles',
      icon: BookOpen,
      color: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800/50',
    },
    {
      title: 'Experiences',
      description: 'Career history, company details, positions, and work experience.',
      href: '/admin/experiences',
      icon: Briefcase,
      color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50',
    },
    {
      title: 'Educations',
      description: 'Academic degrees, university milestones, and fields of study.',
      href: '/admin/educations',
      icon: GraduationCap,
      color: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-200 dark:border-teal-800/50',
    },
    {
      title: 'Certificates',
      description: 'Professional credentials, issuer organizations, and licenses.',
      href: '/admin/certificates',
      icon: Award,
      color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800/50',
    },
    {
      title: 'Skills',
      description: 'Categorized tech stack, programming languages, and tools.',
      href: '/admin/skills',
      icon: Wand2,
      color: 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-200 dark:border-violet-800/50',
    },
    {
      title: 'Packages',
      description: 'Published PyPI, NPM software packages, and monthly downloads.',
      href: '/admin/packages',
      icon: Box,
      color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800/50',
    },
    {
      title: 'Social Posts',
      description: 'Micro-blogs, social network shares, and tech updates.',
      href: '/admin/posts',
      icon: Share2,
      color: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-200 dark:border-cyan-800/50',
    },
    {
      title: 'Videos',
      description: 'Public video talks, YouTube presentations, and tutorials.',
      href: '/admin/videos',
      icon: Video,
      color: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800/50',
    },
  ];

  const toolModules: NavModule[] = [
    {
      title: 'Reactive Resume',
      description: 'Sync and design resumes with Reactive Resume integration.',
      href: '/admin/reactive-resume',
      icon: FileCode2,
      color: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-200 dark:border-sky-800/50',
      badge: 'Integration',
    },
    {
      title: 'AI CV Studio',
      description: 'Generate tailored CVs using LLM models and custom prompts.',
      href: '/admin/ai-cv',
      icon: Sparkles,
      color: 'bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-200 dark:border-pink-800/50',
      badge: 'AI Powered',
    },
    {
      title: 'LinkedIn Import',
      description: 'Import work experience and profile data directly from LinkedIn.',
      href: '/admin/import-linkedin',
      icon: UserCheck,
      color: 'bg-blue-600/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800/50',
      badge: 'Importer',
    },
    {
      title: 'Storage Manager',
      description: 'Manage uploaded files, CV PDFs, and Supabase cloud storage.',
      href: '/admin/storage',
      icon: HardDrive,
      color: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800/50',
    },
    {
      title: 'App Settings',
      description: 'Configure site visibility, SEO, theme preferences, and APIs.',
      href: '/admin/settings',
      icon: Settings,
      color: 'bg-gray-500/10 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800/50',
    },
    {
      title: 'System Logs',
      description: 'Inspect API traffic logs, ingestion status, and error traces.',
      href: '/admin/system-logs',
      icon: ShieldAlert,
      color: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800/50',
    },
  ];

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Dashboard Overview"
        description="Welcome to your ResuMesh Admin Portal. Quick access to all modules below."
        actionLabel={refreshMutation.isPending ? 'Refreshing...' : 'Refresh All Data'}
        actionIcon={
          <RefreshCw
            size={18}
            className={refreshMutation.isPending ? 'animate-spin' : ''}
          />
        }
        onAction={() => refreshMutation.mutate()}
        isPending={refreshMutation.isPending}
      />

      {/* Content Management Modules */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            Content Management
          </h2>
          <span className="font-mono text-xs text-gray-500">
            {contentModules.length} Modules
          </span>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {contentModules.map((module) => {
            const Icon = module.icon;
            return (
              <Link
                key={module.href}
                to={module.href}
                className="group relative flex flex-col justify-between rounded-xl border border-gray-200 bg-white p-5 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-blue-300 hover:shadow-md dark:border-gray-800 dark:bg-gray-900 dark:hover:border-blue-700/60"
              >
                <div>
                  <div className="mb-4 flex items-center justify-between">
                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-lg border ${module.color}`}
                    >
                      <Icon size={22} />
                    </div>

                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-50 text-gray-400 transition-colors group-hover:bg-blue-50 group-hover:text-blue-600 dark:bg-gray-800/60 dark:text-gray-500 dark:group-hover:bg-blue-950/60 dark:group-hover:text-blue-400">
                      <ArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-0.5" />
                    </span>
                  </div>

                  <h3 className="mb-1 text-base font-bold text-gray-900 transition-colors group-hover:text-blue-600 dark:text-gray-100 dark:group-hover:text-blue-400">
                    {module.title}
                  </h3>

                  <p className="text-xs leading-relaxed text-gray-600 dark:text-gray-400 line-clamp-2">
                    {module.description}
                  </p>
                </div>

                <div className="mt-4 flex items-center gap-1 font-mono text-[11px] font-semibold text-blue-600 opacity-0 transition-opacity duration-200 group-hover:opacity-100 dark:text-blue-400">
                  <span>Manage {module.title}</span>
                  <ArrowRight size={12} />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Tools & Settings Modules */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            Tools & Integration Studio
          </h2>
          <span className="font-mono text-xs text-gray-500">
            {toolModules.length} Tools
          </span>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {toolModules.map((module) => {
            const Icon = module.icon;
            return (
              <Link
                key={module.href}
                to={module.href}
                className="group relative flex flex-col justify-between rounded-xl border border-gray-200 bg-white p-5 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-blue-300 hover:shadow-md dark:border-gray-800 dark:bg-gray-900 dark:hover:border-blue-700/60"
              >
                <div>
                  <div className="mb-4 flex items-center justify-between">
                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-lg border ${module.color}`}
                    >
                      <Icon size={22} />
                    </div>

                    {module.badge ? (
                      <span className="rounded-full bg-blue-50 px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:bg-blue-950/80 dark:text-blue-300">
                        {module.badge}
                      </span>
                    ) : (
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-50 text-gray-400 transition-colors group-hover:bg-blue-50 group-hover:text-blue-600 dark:bg-gray-800/60 dark:text-gray-500 dark:group-hover:bg-blue-950/60 dark:group-hover:text-blue-400">
                        <ArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-0.5" />
                      </span>
                    )}
                  </div>

                  <h3 className="mb-1 text-base font-bold text-gray-900 transition-colors group-hover:text-blue-600 dark:text-gray-100 dark:group-hover:text-blue-400">
                    {module.title}
                  </h3>

                  <p className="text-xs leading-relaxed text-gray-600 dark:text-gray-400 line-clamp-2">
                    {module.description}
                  </p>
                </div>

                <div className="mt-4 flex items-center gap-1 font-mono text-[11px] font-semibold text-blue-600 opacity-0 transition-opacity duration-200 group-hover:opacity-100 dark:text-blue-400">
                  <span>Open {module.title}</span>
                  <ArrowRight size={12} />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
