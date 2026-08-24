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
import { Video } from '../../../types';

const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  platform: z.string().min(1, 'Platform is required'),
  url: z.string().url('Must be a valid URL'),
  thumbnail: z.string().url('Must be a valid URL').or(z.literal('')).optional(),
  profile: z.string().optional(),
});

type VideoFormData = z.infer<typeof schema>;

interface VideoFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  video?: Video | null;
}

export default function VideoFormModal({ isOpen, onClose, video }: VideoFormModalProps) {
  const { token } = useAuth();
  const { ADMIN_API_URL } = useEnv();
  const queryClient = useQueryClient();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<VideoFormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (video) {
      reset({
        title: video.title,
        description: video.description || '',
        platform: video.platform || 'youtube',
        url: video.url || '',
        thumbnail: video.thumbnail || '',
        profile: video.profile || '',
      });
    } else {
      reset({
        title: '',
        description: '',
        platform: 'youtube',
        url: '',
        thumbnail: '',
        profile: '',
      });
    }
  }, [video, isOpen, reset]);

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      const apiUrl = `${ADMIN_API_URL}/api/v1/videos/`;
      const url = video ? `${apiUrl}${video.id}` : apiUrl;
      const method = video ? 'put' : 'post';
      await axios({
        method,
        url,
        data,
        headers: { Authorization: `Bearer ${token}` }
      });
    },
    onSuccess: () => {
      toast.success(video ? 'Video updated!' : 'Video created!');
      queryClient.invalidateQueries({ queryKey: ['admin-videos'] });
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to save video.');
    }
  });

  const onSubmit: SubmitHandler<VideoFormData> = (data) => {
    const payload = {
      ...data,
      description: data.description || null,
      thumbnail: data.thumbnail || null,
    };
    saveMutation.mutate(payload);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={video ? 'Edit Video' : 'Add Video'}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
          <input
            {...register('title')}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
            placeholder="A cool tech talk video"
          />
          {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
          <input
            {...register('description')}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
            placeholder="Video description..."
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Platform</label>
            <input
              {...register('platform')}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
              placeholder="youtube"
            />
            {errors.platform && <p className="text-red-500 text-xs mt-1">{errors.platform.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Profile Name / ID</label>
            <input
              {...register('profile')}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
              placeholder="mychannel"
            />
            {errors.profile && <p className="text-red-500 text-xs mt-1">{errors.profile.message}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">URL</label>
          <input
            {...register('url')}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
            placeholder="https://www.youtube.com/watch?v=..."
          />
          {errors.url && <p className="text-red-500 text-xs mt-1">{errors.url.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Thumbnail URL</label>
          <input
            {...register('thumbnail')}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
            placeholder="https://img.youtube.com/vi/..."
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
