import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import {
  ChevronDown,
  Code,
  Edit2,
  ExternalLink,
  FolderGit,
  GitFork,
  RefreshCw,
  Search,
  Star,
  Trash2,
  X,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

import AdminPageHeader from '../../components/admin/AdminPageHeader';
import ConfirmDeleteModal from '../../components/admin/ConfirmDeleteModal';
import ProjectFormModal from '../../components/admin/forms/ProjectFormModal';
import { ContentCardSkeleton } from '../../components/ui/ContentCardSkeleton';
import EmptyState from '../../components/ui/EmptyState';
import { useAuth } from '../../context/AuthContext';
import { useEnv } from '../../hooks/useEnv';
import { Project } from '../../types';

export default function AdminProjects() {
  const { token } = useAuth();
  const { ADMIN_API_URL } = useEnv();
  const queryClient = useQueryClient();

  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('All');
  const [sortBy, setSortBy] = useState<
    'stars' | 'forks' | 'date_desc' | 'alphabetical'
  >('stars');

  // Read
  const { data: projects = [], isLoading } = useQuery<Project[]>({
    queryKey: ['admin-projects'],
    queryFn: async () => {
      const res = await axios.get(`${ADMIN_API_URL}/api/v1/projects/`);
      return res.data;
    },
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(`${ADMIN_API_URL}/api/v1/projects/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onSuccess: () => {
      toast.success('Project deleted successfully.');
      queryClient.invalidateQueries({ queryKey: ['admin-projects'] });
      setProjectToDelete(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to delete project.');
      setProjectToDelete(null);
    },
  });

  // Refresh Mutation
  const refreshMutation = useMutation({
    mutationFn: async () => {
      const githubUser = import.meta.env.VITE_GITHUB_USERNAME || 'AtaCanYmc';
      await axios.post(
        `${ADMIN_API_URL}/api/v1/projects/refresh`,
        { username: githubUser, platform: 'github' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    },
    onSuccess: () => {
      toast.success('Projects ingestion started in background.');
      queryClient.invalidateQueries({ queryKey: ['admin-projects'] });
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.detail || 'Failed to trigger projects refresh.'
      );
    },
  });

  const handleEdit = (project: Project) => {
    setProjectToEdit(project);
    setIsFormOpen(true);
  };

  const handleAdd = () => {
    setProjectToEdit(null);
    setIsFormOpen(true);
  };

  const confirmDelete = () => {
    if (projectToDelete) {
      deleteMutation.mutate(projectToDelete.id);
    }
  };

  // Filter languages
  const rawLanguages = Array.from(
    new Set(projects.flatMap((p) => p.languages || []))
  ).filter(Boolean);

  const filteredProjects = projects.filter((p) => {
    const matchesCategory = filter === 'All' || p.languages?.includes(filter);
    const q = searchQuery.trim().toLowerCase();
    if (!q) return matchesCategory;

    const nameMatch = (p.name || p.title || '').toLowerCase().includes(q);
    const descMatch = (p.description || '').toLowerCase().includes(q);
    const langMatch = (p.languages || []).some((l) =>
      l.toLowerCase().includes(q)
    );

    return matchesCategory && (nameMatch || descMatch || langMatch);
  });

  const sortedProjects = [...filteredProjects].sort((a, b) => {
    switch (sortBy) {
      case 'stars':
        return (b.stars || 0) - (a.stars || 0);
      case 'forks':
        return (b.forks || 0) - (a.forks || 0);
      case 'date_desc':
        return (
          new Date(b.created_at || 0).getTime() -
          new Date(a.created_at || 0).getTime()
        );
      case 'alphabetical':
        return (a.name || a.title || '').localeCompare(b.name || b.title || '');
      default:
        return 0;
    }
  });

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Projects"
        description="Manage your open source and personal projects."
        actionLabel="Add Project"
        onAction={handleAdd}
        secondaryActionLabel={
          refreshMutation.isPending ? 'Refreshing...' : 'Refresh GitHub'
        }
        secondaryActionIcon={
          <RefreshCw
            size={18}
            className={refreshMutation.isPending ? 'animate-spin' : ''}
          />
        }
        onSecondaryAction={() => refreshMutation.mutate()}
        isSecondaryPending={refreshMutation.isPending}
      />

      {/* Controls: Search, Language Filter, Sort */}
      {projects.length > 0 && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search projects..."
              className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-8 text-xs text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none dark:border-gray-800 dark:bg-gray-900 dark:text-gray-100 dark:placeholder-gray-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {rawLanguages.length > 0 && (
              <div className="relative w-full sm:w-44">
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="w-full cursor-pointer appearance-none rounded-lg border border-gray-200 bg-white py-2 pl-3 pr-8 text-xs text-gray-700 focus:border-blue-500 focus:outline-none dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300"
                >
                  <option value="All">All Languages</option>
                  {rawLanguages.map((lang) => (
                    <option key={lang} value={lang}>
                      {lang}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={14}
                  className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400"
                />
              </div>
            )}

            <div className="relative w-full sm:w-44">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full cursor-pointer appearance-none rounded-lg border border-gray-200 bg-white py-2 pl-3 pr-8 text-xs text-gray-700 focus:border-blue-500 focus:outline-none dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300"
              >
                <option value="stars">Sort by Stars</option>
                <option value="forks">Sort by Forks</option>
                <option value="date_desc">Newest First</option>
                <option value="alphabetical">Alphabetical</option>
              </select>
              <ChevronDown
                size={14}
                className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
            </div>
          </div>
        </div>
      )}

      {/* Grid Layout */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, idx) => (
            <ContentCardSkeleton key={idx} />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <EmptyState
          icon={FolderGit}
          title="No projects added yet"
          message="Showcase your coding skills by adding open-source projects or personal works."
          actionLabel="Add Project"
          onAction={handleAdd}
        />
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {sortedProjects.map((project) => (
            <div
              key={project.id}
              className="group relative flex flex-col justify-between rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
            >
              <div>
                {/* Header: Title & Actions */}
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <Code
                      size={18}
                      className="shrink-0 text-gray-400 dark:text-gray-500"
                    />
                    <h3
                      className="truncate text-base font-bold text-gray-900 transition-colors group-hover:text-blue-600 dark:text-gray-100 dark:group-hover:text-blue-400"
                      title={project.name || project.title}
                    >
                      {project.name || project.title}
                    </h3>
                  </div>

                  <div className="flex shrink-0 items-center gap-1">
                    {project.url && (
                      <a
                        href={project.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-md p-1.5 text-gray-400 transition-colors hover:text-gray-700 dark:hover:text-gray-200"
                        title="View Repository"
                      >
                        <ExternalLink size={15} />
                      </a>
                    )}
                    <button
                      onClick={() => handleEdit(project)}
                      className="cursor-pointer rounded-md p-1.5 text-gray-400 transition-colors hover:text-blue-600 dark:hover:text-blue-400"
                      title="Edit Project"
                    >
                      <Edit2 size={15} />
                    </button>
                    <button
                      onClick={() => setProjectToDelete(project)}
                      className="cursor-pointer rounded-md p-1.5 text-gray-400 transition-colors hover:text-red-600 dark:hover:text-red-400"
                      title="Delete Project"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                {/* Description */}
                <p className="mb-4 text-xs leading-relaxed text-gray-600 dark:text-gray-400 line-clamp-3">
                  {project.description || 'No description provided.'}
                </p>
              </div>

              <div>
                {/* Languages Badges */}
                {project.languages && project.languages.length > 0 && (
                  <div className="mb-4 flex flex-wrap gap-1.5">
                    {project.languages.slice(0, 4).map((lang, idx) => (
                      <span
                        key={idx}
                        className="rounded border border-gray-200 bg-gray-100 px-2 py-0.5 font-mono text-[11px] font-medium text-gray-700 dark:border-gray-700/60 dark:bg-gray-800/80 dark:text-gray-300"
                      >
                        {lang}
                      </span>
                    ))}
                    {project.languages.length > 4 && (
                      <span className="rounded border border-gray-200 bg-gray-100 px-2 py-0.5 font-mono text-[11px] font-medium text-gray-500 dark:border-gray-700 dark:bg-gray-800">
                        +{project.languages.length - 4}
                      </span>
                    )}
                  </div>
                )}

                {/* Footer Metrics */}
                <div className="flex items-center justify-between border-t border-gray-100 pt-3 text-xs text-gray-500 dark:border-gray-800/80 dark:text-gray-400">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 font-mono">
                      <Star
                        size={13}
                        className="fill-amber-500/20 text-amber-500"
                      />
                      {project.stars || 0}
                    </span>
                    <span className="flex items-center gap-1 font-mono">
                      <GitFork size={13} className="text-gray-400" />
                      {project.forks || 0}
                    </span>
                  </div>

                  {project.created_at && (
                    <span className="font-mono text-[11px] text-gray-400">
                      {new Date(project.created_at).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDeleteModal
        isOpen={!!projectToDelete}
        onClose={() => setProjectToDelete(null)}
        onConfirm={confirmDelete}
        title="Delete Project"
        message={`Are you sure you want to delete "${
          projectToDelete?.title || projectToDelete?.name
        }"? This action cannot be undone.`}
        isDeleting={deleteMutation.isPending}
      />

      <ProjectFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        project={projectToEdit}
      />
    </div>
  );
}
