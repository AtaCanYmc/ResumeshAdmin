import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import {
  BookOpen,
  Calendar,
  Clock,
  Edit2,
  ExternalLink,
  RefreshCw,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

import AdminPageHeader from '../../components/admin/AdminPageHeader';
import ConfirmDeleteModal from '../../components/admin/ConfirmDeleteModal';
import ArticleFormModal from '../../components/admin/forms/ArticleFormModal';
import { ContentCardSkeleton } from '../../components/ui/ContentCardSkeleton';
import EmptyState from '../../components/ui/EmptyState';
import { useAuth } from '../../context/AuthContext';
import { useEnv } from '../../hooks/useEnv';
import { Article } from '../../types';

export default function AdminArticles() {
  const { token } = useAuth();
  const { ADMIN_API_URL } = useEnv();
  const queryClient = useQueryClient();

  const [articleToDelete, setArticleToDelete] = useState<Article | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [articleToEdit, setArticleToEdit] = useState<Article | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [platformFilter, setPlatformFilter] = useState('ALL');

  const { data: articles = [], isLoading } = useQuery<Article[]>({
    queryKey: ['admin-articles'],
    queryFn: async () => {
      const res = await axios.get(`${ADMIN_API_URL}/api/v1/articles/`);
      return res.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await axios.delete(`${ADMIN_API_URL}/api/v1/articles/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onSuccess: () => {
      toast.success('Article deleted successfully.');
      queryClient.invalidateQueries({ queryKey: ['admin-articles'] });
      setArticleToDelete(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to delete article.');
      setArticleToDelete(null);
    },
  });

  const refreshMutation = useMutation({
    mutationFn: async () => {
      const devtoUser = import.meta.env.VITE_DEVTO_USERNAME || 'atacanymc';
      const mediumUser = import.meta.env.VITE_MEDIUM_USERNAME || 'atacanymc';

      await Promise.all([
        axios.post(
          `${ADMIN_API_URL}/api/v1/articles/refresh`,
          { username: devtoUser, platform: 'devto' },
          { headers: { Authorization: `Bearer ${token}` } }
        ),
        axios.post(
          `${ADMIN_API_URL}/api/v1/articles/refresh`,
          { username: mediumUser, platform: 'medium' },
          { headers: { Authorization: `Bearer ${token}` } }
        ),
      ]);
    },
    onSuccess: () => {
      toast.success('Articles ingestion started in background.');
      queryClient.invalidateQueries({ queryKey: ['admin-articles'] });
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.detail || 'Failed to trigger articles refresh.'
      );
    },
  });

  const handleEdit = (article: Article) => {
    setArticleToEdit(article);
    setIsFormOpen(true);
  };

  const handleAdd = () => {
    setArticleToEdit(null);
    setIsFormOpen(true);
  };

  const confirmDelete = () => {
    if (articleToDelete) {
      deleteMutation.mutate(articleToDelete.id);
    }
  };

  const filteredArticles = articles.filter((article) => {
    const platform = (article.platform || '').toUpperCase();
    const matchesPlatform =
      platformFilter === 'ALL' || platform.includes(platformFilter);

    const q = searchQuery.trim().toLowerCase();
    if (!q) return matchesPlatform;

    const titleMatch = (article.title || '').toLowerCase().includes(q);
    const summaryMatch = (article.summary || article.description || '')
      .toLowerCase()
      .includes(q);

    return matchesPlatform && (titleMatch || summaryMatch);
  });

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Articles"
        description="Manage your published articles and blog posts."
        actionLabel="Add Article"
        onAction={handleAdd}
        secondaryActionLabel={
          refreshMutation.isPending ? 'Refreshing...' : 'Refresh Articles'
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

      {/* Controls: Search & Platform Tabs */}
      {articles.length > 0 && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search articles..."
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

          <div className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white p-1 dark:border-gray-800 dark:bg-gray-900">
            {['ALL', 'MEDIUM', 'DEV'].map((tab) => (
              <button
                key={tab}
                onClick={() => setPlatformFilter(tab)}
                className={`cursor-pointer rounded-md px-3 py-1 text-xs font-medium transition-all ${
                  platformFilter === tab
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
                }`}
              >
                {tab === 'ALL' ? 'All' : tab === 'DEV' ? 'Dev.to' : 'Medium'}
              </button>
            ))}
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
      ) : articles.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No articles added yet"
          message="Share your professional knowledge and writing by adding links to your blog posts."
          actionLabel="Add Article"
          onAction={handleAdd}
        />
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filteredArticles.map((article) => (
            <div
              key={article.id}
              className="group relative flex flex-col justify-between rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
            >
              <div>
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <BookOpen
                      size={18}
                      className="shrink-0 text-blue-500 dark:text-blue-400"
                    />
                    <span className="rounded bg-blue-50 px-2 py-0.5 font-mono text-[11px] font-medium text-blue-600 dark:bg-blue-950/60 dark:text-blue-300">
                      {article.platform || 'Article'}
                    </span>
                  </div>

                  <div className="flex shrink-0 items-center gap-1">
                    {article.url && (
                      <a
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-md p-1.5 text-gray-400 transition-colors hover:text-gray-700 dark:hover:text-gray-200"
                        title="Read Article"
                      >
                        <ExternalLink size={15} />
                      </a>
                    )}
                    <button
                      onClick={() => handleEdit(article)}
                      className="cursor-pointer rounded-md p-1.5 text-gray-400 transition-colors hover:text-blue-600 dark:hover:text-blue-400"
                      title="Edit Article"
                    >
                      <Edit2 size={15} />
                    </button>
                    <button
                      onClick={() => setArticleToDelete(article)}
                      className="cursor-pointer rounded-md p-1.5 text-gray-400 transition-colors hover:text-red-600 dark:hover:text-red-400"
                      title="Delete Article"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                <h3
                  className="mb-2 line-clamp-2 text-base font-bold text-gray-900 transition-colors group-hover:text-blue-600 dark:text-gray-100 dark:group-hover:text-blue-400"
                  title={article.title}
                >
                  {article.title}
                </h3>

                <p className="mb-4 text-xs leading-relaxed text-gray-600 dark:text-gray-400 line-clamp-3">
                  {article.summary ||
                    article.description ||
                    'No summary provided.'}
                </p>
              </div>

              <div className="flex items-center justify-between border-t border-gray-100 pt-3 text-xs text-gray-500 dark:border-gray-800/80 dark:text-gray-400">
                <div className="flex items-center gap-3">
                  {(article.published_at || article.published_date) && (
                    <span className="flex items-center gap-1 font-mono text-[11px]">
                      <Calendar size={13} className="text-gray-400" />
                      {new Date(
                        article.published_at || article.published_date || ''
                      ).toLocaleDateString()}
                    </span>
                  )}
                </div>

                {article.reading_time_minutes && (
                  <span className="flex items-center gap-1 font-mono text-[11px] text-gray-400">
                    <Clock size={13} />
                    {article.reading_time_minutes} min read
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDeleteModal
        isOpen={!!articleToDelete}
        onClose={() => setArticleToDelete(null)}
        onConfirm={confirmDelete}
        title="Delete Article"
        message={`Are you sure you want to delete "${articleToDelete?.title}"? This action cannot be undone.`}
        isDeleting={deleteMutation.isPending}
      />

      <ArticleFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        article={articleToEdit}
      />
    </div>
  );
}
