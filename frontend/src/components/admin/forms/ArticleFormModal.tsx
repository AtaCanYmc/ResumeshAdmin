import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../../context/AuthContext';
import { useEnv } from '../../../hooks/useEnv';
import Modal from '../../Modal';
import { Article } from '../../../types';

const articleSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  summary: z.string().optional(),
  url: z.string().url('Must be a valid URL'),
  platform: z.enum(['MEDIUM', 'DEV_TO']),
  reading_time_minutes: z.number().min(0).default(0),
  published_at: z.string().optional(),
});

type ArticleFormData = z.infer<typeof articleSchema>;

interface ArticleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  article?: Article | null;
}

export default function ArticleFormModal({ isOpen, onClose, article }: ArticleFormModalProps) {
  const { token } = useAuth();
  const { ADMIN_API_URL } = useEnv();
  const queryClient = useQueryClient();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ArticleFormData>({
    resolver: zodResolver(articleSchema),
    defaultValues: {
      platform: 'MEDIUM',
      reading_time_minutes: 0
    }
  });

  useEffect(() => {
    if (article && isOpen) {
      const formatDateTime = (dateString?: string) => dateString ? dateString.slice(0, 16) : '';
      reset({
        title: article.title,
        summary: article.summary || '',
        url: article.url,
        platform: article.platform,
        reading_time_minutes: article.reading_time_minutes || 0,
        published_at: formatDateTime(article.published_at),
      });
    } else if (isOpen) {
      reset({
        title: '',
        summary: '',
        url: '',
        platform: 'MEDIUM',
        reading_time_minutes: 0,
        published_at: '',
      });
    }
  }, [article, isOpen, reset]);

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      const url = article
        ? `${ADMIN_API_URL}/api/v1/articles/${article.id}`
        : `${ADMIN_API_URL}/api/v1/articles/`;
      const method = article ? 'put' : 'post';
      await axios({
        method,
        url,
        data,
        headers: { Authorization: `Bearer ${token}` }
      });
    },
    onSuccess: () => {
      toast.success(article ? 'Article updated!' : 'Article created!');
      queryClient.invalidateQueries({ queryKey: ['admin-articles'] });
      queryClient.invalidateQueries({ queryKey: ['home-data'] });
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to save article.');
    }
  });

  const onSubmit = (data: ArticleFormData) => {
    const payload = {
      ...data,
      summary: data.summary || null,
      published_at: data.published_at ? new Date(data.published_at).toISOString() : null,
    };
    saveMutation.mutate(payload);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={article ? 'Edit Article' : 'Add Article'}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
          <input
            {...register('title')}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
            placeholder="My Awesome Article"
          />
          {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">URL</label>
          <input
            {...register('url')}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
            placeholder="https://medium.com/..."
          />
          {errors.url && <p className="text-red-500 text-xs mt-1">{errors.url.message}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Platform</label>
            <select
              {...register('platform')}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
            >
              <option value="MEDIUM">Medium</option>
              <option value="DEV_TO">Dev.to</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Reading Time (min)</label>
            <input
              type="number"
              {...register('reading_time_minutes', { valueAsNumber: true })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Published At</label>
          <input
            type="datetime-local"
            {...register('published_at')}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-colors [color-scheme:light] dark:[color-scheme:dark]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Summary</label>
          <textarea
            {...register('summary')}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-colors resize-none"
            placeholder="A brief summary..."
          />
        </div>

        <div className="pt-4 flex justify-end gap-3 border-t border-gray-200 dark:border-gray-800 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors focus:outline-none"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saveMutation.isPending}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-50"
          >
            {saveMutation.isPending ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
