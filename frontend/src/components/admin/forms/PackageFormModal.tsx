import { useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../../context/AuthContext';
import { useEnv } from '../../../hooks/useEnv';
import Modal from '../../Modal';
import { Package } from '../../../types';

const packageSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  platform: z.string().min(1, 'Platform is required'),
  url: z.union([z.literal(''), z.string().url('Invalid URL')]).optional(),
  docs_url: z.union([z.literal(''), z.string().url('Invalid URL')]).optional(),
  tags: z.string().optional(),
  version: z.string().optional(),
  last_month_downloads: z.coerce.number().min(0).default(0),
});

type PackageFormData = z.infer<typeof packageSchema>;

interface PackageFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  pkg?: Package | null;
}

export default function PackageFormModal({ isOpen, onClose, pkg }: PackageFormModalProps) {
  const { token } = useAuth();
  const { ADMIN_API_URL } = useEnv();
  const queryClient = useQueryClient();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<PackageFormData>({
    resolver: zodResolver(packageSchema),
  });

  useEffect(() => {
    if (pkg && isOpen) {
      reset({
        title: pkg.title,
        description: pkg.description || '',
        platform: pkg.platform || 'npm',
        url: pkg.url || '',
        docs_url: pkg.docs_url || '',
        tags: pkg.tags || '',
        version: pkg.version || '',
        last_month_downloads: pkg.last_month_downloads || 0,
      });
    } else if (isOpen) {
      reset({
        title: '',
        description: '',
        platform: 'npm',
        url: '',
        docs_url: '',
        tags: '',
        version: '',
        last_month_downloads: 0,
      });
    }
  }, [pkg, isOpen, reset]);

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      const apiUrl = `${ADMIN_API_URL}/api/v1/packages/`;
      const url = pkg ? `${apiUrl}${pkg.id}` : apiUrl;
      const method = pkg ? 'put' : 'post';
      await axios({
        method,
        url,
        data,
        headers: { Authorization: `Bearer ${token}` }
      });
    },
    onSuccess: () => {
      toast.success(pkg ? 'Package updated!' : 'Package created!');
      queryClient.invalidateQueries({ queryKey: ['admin-packages'] });
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to save package.');
    }
  });

  const onSubmit: SubmitHandler<PackageFormData> = (data) => {
    const payload = {
      ...data,
      description: data.description || null,
      url: data.url || null,
      docs_url: data.docs_url || null,
      tags: data.tags || null,
      version: data.version || null,
    };
    saveMutation.mutate(payload);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={pkg ? 'Edit Package' : 'Add Package'}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
          <input
            {...register('title')}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
            placeholder="my-cool-package"
          />
          {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
          <textarea
            {...register('description')}
            rows={2}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-colors resize-none"
            placeholder="A short description..."
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Platform</label>
            <input
              {...register('platform')}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
              placeholder="npm or pypi"
            />
            {errors.platform && <p className="text-red-500 text-xs mt-1">{errors.platform.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Version</label>
            <input
              {...register('version')}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
              placeholder="1.0.0"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">URL</label>
            <input
              {...register('url')}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
              placeholder="https://www.npmjs.com/package/..."
            />
            {errors.url && <p className="text-red-500 text-xs mt-1">{errors.url.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Docs URL</label>
            <input
              {...register('docs_url')}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
              placeholder="https://..."
            />
            {errors.docs_url && <p className="text-red-500 text-xs mt-1">{errors.docs_url.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tags</label>
            <input
              {...register('tags')}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
              placeholder="react,hook,zod"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Monthly Downloads</label>
            <input
              type="number"
              {...register('last_month_downloads', { valueAsNumber: true })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
            />
          </div>
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
