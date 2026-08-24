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
import { Post } from '../../../types';

const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  platform: z.string().min(1, 'Platform is required'),
  url: z.string().url('Must be a valid URL').or(z.literal('')).optional(),
  thumbnail: z.string().url('Must be a valid URL').or(z.literal('')).optional(),
  profile: z.string().optional(),
});

type PostFormData = z.infer<typeof schema>;

interface PostFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  post?: Post | null;
}

export default function PostFormModal({ isOpen, onClose, post }: PostFormModalProps) {
  const { token } = useAuth();
  const { ADMIN_API_URL } = useEnv();
  const queryClient = useQueryClient();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<PostFormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (post) {
      reset({
        title: post.title,
        description: post.description || '',
        platform: post.platform || '',
        url: post.url || '',
        thumbnail: post.thumbnail || '',
        profile: post.profile || '',
      });
    } else {
      reset({
        title: '',
        description: '',
        platform: '',
        url: '',
        thumbnail: '',
        profile: '',
      });
    }
  }, [post, isOpen, reset]);

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      const apiUrl = `${ADMIN_API_URL}/api/v1/posts/`;
      const url = post ? `${apiUrl}${post.id}` : apiUrl;
      const method = post ? 'put' : 'post';
      await axios({
        method,
        url,
        data,
        headers: { Authorization: `Bearer ${token}` }
      });
    },
    onSuccess: () => {
      toast.success(post ? 'Post updated!' : 'Post created!');
      queryClient.invalidateQueries({ queryKey: ['admin-posts'] });
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to save post.');
    }
  });

  const onSubmit: SubmitHandler<PostFormData> = (data) => {
    const payload = {
      ...data,
      description: data.description || null,
      platform: data.platform || null,
      url: data.url || null,
      thumbnail: data.thumbnail || null,
      profile: data.profile || null,
    };
    saveMutation.mutate(payload);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={post ? 'Edit Post' : 'Add Post'}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
          <input
            {...register('title')}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
            placeholder="A cool post"
          />
          {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
          <textarea
            {...register('description')}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-colors resize-none"
            placeholder="Post details..."
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Platform</label>
            <input
              {...register('platform')}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
              placeholder="LinkedIn, Twitter, etc."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Profile Name / ID</label>
            <input
              {...register('profile')}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
              placeholder="myprofile"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">URL</label>
          <input
            {...register('url')}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
            placeholder="https://example.com/posts/..."
          />
          {errors.url && <p className="text-red-500 text-xs mt-1">{errors.url.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Thumbnail URL</label>
          <input
            {...register('thumbnail')}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
            placeholder="https://..."
          />
          {errors.thumbnail && <p className="text-red-500 text-xs mt-1">{errors.thumbnail.message}</p>}
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
