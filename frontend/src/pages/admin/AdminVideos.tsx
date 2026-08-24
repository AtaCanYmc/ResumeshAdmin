import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Video as VideoIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useEnv } from '../../hooks/useEnv';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import DataTable from '../../components/admin/DataTable';
import ConfirmDeleteModal from '../../components/admin/ConfirmDeleteModal';
import VideoFormModal from '../../components/admin/forms/VideoFormModal';
import EmptyState from '../../components/ui/EmptyState';
import { TableSkeleton } from '../../components/ui/Skeletons';
import { Video } from '../../types';

export default function AdminVideos() {
  const { token } = useAuth();
  const { ADMIN_API_URL } = useEnv();
  const queryClient = useQueryClient();
  const [videoToDelete, setVideoToDelete] = useState<Video | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [videoToEdit, setVideoToEdit] = useState<Video | null>(null);

  const { data: videos = [], isLoading } = useQuery<Video[]>({
    queryKey: ['admin-videos'],
    queryFn: async () => {
      const res = await axios.get(
        `${ADMIN_API_URL}/api/v1/videos/`
      );
      return res.data;
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(
        `${ADMIN_API_URL}/api/v1/videos/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
    },
    onSuccess: () => {
      toast.success('Video deleted successfully.');
      queryClient.invalidateQueries({ queryKey: ['admin-videos'] });
      setVideoToDelete(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to delete video.');
      setVideoToDelete(null);
    }
  });

  const columns = [
    {
      header: 'Title',
      accessorKey: 'title',
      cell: (v: Video) => (
        <span className="font-medium text-gray-900 dark:text-white">{v.title}</span>
      )
    },
    {
      header: 'Platform',
      accessorKey: 'platform',
      cell: (v: Video) => <span className="capitalize">{v.platform}</span>
    },
    {
      header: 'Channel / Profile',
      accessorKey: 'profile',
      cell: (v: Video) => v.profile
    },
    {
      header: 'Url',
      accessorKey: 'url',
      cell: (v: Video) => (
        <a
          href={v.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 dark:text-blue-400 hover:underline"
        >
          Link
        </a>
      )
    }
  ];

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

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Videos"
        description="Manage your video records, presentations, and tutorials."
        actionLabel="Add Video"
        onAction={handleAdd}
      />

      {isLoading ? (
        <TableSkeleton />
      ) : videos.length === 0 ? (
        <EmptyState
          icon={VideoIcon}
          title="No videos added yet"
          message="Display your presentations and tech talks by adding links to your public videos."
          actionLabel="Add Video"
          onAction={handleAdd}
        />
      ) : (
        <DataTable
          data={videos}
          columns={columns}
          keyExtractor={(v) => v.id}
          onEdit={handleEdit}
          onDelete={(v) => setVideoToDelete(v)}
        />
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
