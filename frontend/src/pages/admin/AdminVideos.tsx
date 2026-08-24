import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import {
  Calendar,
  Edit2,
  ExternalLink,
  Play,
  Search,
  Trash2,
  Video as VideoIcon,
  X,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

import AdminPageHeader from '../../components/admin/AdminPageHeader';
import ConfirmDeleteModal from '../../components/admin/ConfirmDeleteModal';
import VideoFormModal from '../../components/admin/forms/VideoFormModal';
import { ContentCardSkeleton } from '../../components/ui/ContentCardSkeleton';
import EmptyState from '../../components/ui/EmptyState';
import { useAuth } from '../../context/AuthContext';
import { useEnv } from '../../hooks/useEnv';
import { Video } from '../../types';

export default function AdminVideos() {
  const { token } = useAuth();
  const { ADMIN_API_URL } = useEnv();
  const queryClient = useQueryClient();

  const [videoToDelete, setVideoToDelete] = useState<Video | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [videoToEdit, setVideoToEdit] = useState<Video | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: videos = [], isLoading } = useQuery<Video[]>({
    queryKey: ['admin-videos'],
    queryFn: async () => {
      const res = await axios.get(`${ADMIN_API_URL}/api/v1/videos/`);
      return res.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(`${ADMIN_API_URL}/api/v1/videos/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onSuccess: () => {
      toast.success('Video deleted successfully.');
      queryClient.invalidateQueries({ queryKey: ['admin-videos'] });
      setVideoToDelete(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to delete video.');
      setVideoToDelete(null);
    },
  });

  const handleEdit = (v: Video) => {
    setVideoToEdit(v);
    setIsFormOpen(true);
  };

  const handleAdd = () => {
    setVideoToEdit(null);
    setIsFormOpen(true);
  };

  const confirmDelete = () => {
    if (videoToDelete) {
      deleteMutation.mutate(videoToDelete.id);
    }
  };

  const filteredVideos = videos.filter((video) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;

    return (
      (video.title || '').toLowerCase().includes(q) ||
      (video.description || '').toLowerCase().includes(q) ||
      (video.platform || '').toLowerCase().includes(q) ||
      (video.profile || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Videos"
        description="Manage your video records, presentations, and tutorials."
        actionLabel="Add Video"
        onAction={handleAdd}
      />

      {/* Controls: Search */}
      {videos.length > 0 && (
        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search videos..."
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
      )}

      {/* Grid Layout */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, idx) => (
            <ContentCardSkeleton key={idx} />
          ))}
        </div>
      ) : videos.length === 0 ? (
        <EmptyState
          icon={VideoIcon}
          title="No videos added yet"
          message="Display your presentations and tech talks by adding links to your public videos."
          actionLabel="Add Video"
          onAction={handleAdd}
        />
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filteredVideos.map((video) => (
            <div
              key={video.id}
              className="group relative flex flex-col justify-between rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
            >
              <div>
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <VideoIcon
                      size={18}
                      className="shrink-0 text-red-500 dark:text-red-400"
                    />
                    <span className="rounded bg-red-50 px-2 py-0.5 font-mono text-[11px] font-semibold text-red-700 capitalize dark:bg-red-950/60 dark:text-red-300">
                      {video.platform || 'Video'}
                    </span>
                  </div>

                  <div className="flex shrink-0 items-center gap-1">
                    {video.url && (
                      <a
                        href={video.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-md p-1.5 text-gray-400 transition-colors hover:text-gray-700 dark:hover:text-gray-200"
                        title="Watch Video"
                      >
                        <ExternalLink size={15} />
                      </a>
                    )}
                    <button
                      onClick={() => handleEdit(video)}
                      className="cursor-pointer rounded-md p-1.5 text-gray-400 transition-colors hover:text-blue-600 dark:hover:text-blue-400"
                      title="Edit Video"
                    >
                      <Edit2 size={15} />
                    </button>
                    <button
                      onClick={() => setVideoToDelete(video)}
                      className="cursor-pointer rounded-md p-1.5 text-gray-400 transition-colors hover:text-red-600 dark:hover:text-red-400"
                      title="Delete Video"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                <h3
                  className="mb-2 line-clamp-2 text-base font-bold text-gray-900 transition-colors group-hover:text-blue-600 dark:text-gray-100 dark:group-hover:text-blue-400"
                  title={video.title}
                >
                  {video.title}
                </h3>

                <p className="mb-4 text-xs leading-relaxed text-gray-600 dark:text-gray-400 line-clamp-3">
                  {video.description || 'No description available.'}
                </p>
              </div>

              <div className="flex items-center justify-between border-t border-gray-100 pt-3 text-xs text-gray-500 dark:border-gray-800/80 dark:text-gray-400">
                {video.profile && (
                  <span className="font-mono text-[11px] text-gray-500 dark:text-gray-400">
                    {video.profile}
                  </span>
                )}

                {video.url && (
                  <a
                    href={video.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 font-mono text-[11px] text-red-600 hover:underline dark:text-red-400"
                  >
                    <Play size={12} className="fill-current" />
                    Watch
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDeleteModal
        isOpen={!!videoToDelete}
        onClose={() => setVideoToDelete(null)}
        onConfirm={confirmDelete}
        title="Delete Video"
        message={`Are you sure you want to delete "${videoToDelete?.title}"? This action cannot be undone.`}
        isDeleting={deleteMutation.isPending}
      />

      <VideoFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        video={videoToEdit}
      />
    </div>
  );
}
