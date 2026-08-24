import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Share2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useEnv } from '../../hooks/useEnv';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import DataTable from '../../components/admin/DataTable';
import ConfirmDeleteModal from '../../components/admin/ConfirmDeleteModal';
import PostFormModal from '../../components/admin/forms/PostFormModal';
import EmptyState from '../../components/ui/EmptyState';
import { TableSkeleton } from '../../components/ui/Skeletons';
import { Post } from '../../types';

export default function AdminPosts() {
  const { token } = useAuth();
  const { ADMIN_API_URL } = useEnv();
  const queryClient = useQueryClient();
  const [postToDelete, setPostToDelete] = useState<Post | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [postToEdit, setPostToEdit] = useState<Post | null>(null);

  const { data: posts = [], isLoading } = useQuery<Post[]>({
    queryKey: ['admin-posts'],
    queryFn: async () => {
      const res = await axios.get(
        `${ADMIN_API_URL}/api/v1/posts/`
      );
      return res.data;
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(
        `${ADMIN_API_URL}/api/v1/posts/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
    },
    onSuccess: () => {
      toast.success('Post deleted successfully.');
      queryClient.invalidateQueries({ queryKey: ['admin-posts'] });
      setPostToDelete(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to delete post.');
      setPostToDelete(null);
    }
  });

  const columns = [
    {
      header: 'Title',
      accessorKey: 'title',
      cell: (p: Post) => (
        <span className="font-medium text-gray-900 dark:text-white">{p.title}</span>
      )
    },
    {
      header: 'Platform',
      accessorKey: 'platform',
      cell: (p: Post) => <span className="capitalize">{p.platform || '-'}</span>
    },
    {
      header: 'Profile',
      accessorKey: 'profile',
      cell: (p: Post) => p.profile || '-'
    },
    {
      header: 'Url',
      accessorKey: 'url',
      cell: (p: Post) =>
        p.url ? (
          <a
            href={p.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Link
          </a>
        ) : (
          '-'
        )
    }
  ];

  const handleEdit = (p: Post) => {
    setPostToEdit(p);
    setIsFormOpen(true);
  };

  const handleAdd = () => {
    setPostToEdit(null);
    setIsFormOpen(true);
  };

  const confirmDelete = () => {
    if (postToDelete) {
      deleteMutation.mutate(postToDelete.id);
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Social Posts"
        description="Manage your professional social network posts and micro-blogs."
        actionLabel="Add Post"
        onAction={handleAdd}
      />

      {isLoading ? (
        <TableSkeleton />
      ) : posts.length === 0 ? (
        <EmptyState
          icon={Share2}
          title="No posts added yet"
          message="Highlight your online presence by sharing links to your popular social media posts."
          actionLabel="Add Post"
          onAction={handleAdd}
        />
      ) : (
        <DataTable
          data={posts}
          columns={columns}
          keyExtractor={(p) => p.id}
          onEdit={handleEdit}
          onDelete={(p) => setPostToDelete(p)}
        />
      )}

      <ConfirmDeleteModal
        isOpen={!!postToDelete}
        onClose={() => setPostToDelete(null)}
        onConfirm={confirmDelete}
        title="Delete Post"
        message={`Are you sure you want to delete "${postToDelete?.title}"? This action cannot be undone.`}
        isDeleting={deleteMutation.isPending}
      />

      <PostFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        post={postToEdit}
      />
    </div>
  );
}
