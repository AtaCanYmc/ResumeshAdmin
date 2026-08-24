import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import {
  Calendar,
  Edit2,
  ExternalLink,
  MessageSquare,
  Search,
  Share2,
  Trash2,
  X,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

import AdminPageHeader from '../../components/admin/AdminPageHeader';
import ConfirmDeleteModal from '../../components/admin/ConfirmDeleteModal';
import PostFormModal from '../../components/admin/forms/PostFormModal';
import { ContentCardSkeleton } from '../../components/ui/ContentCardSkeleton';
import EmptyState from '../../components/ui/EmptyState';
import { useAuth } from '../../context/AuthContext';
import { useEnv } from '../../hooks/useEnv';
import { Post } from '../../types';

export default function AdminPosts() {
  const { token } = useAuth();
  const { ADMIN_API_URL } = useEnv();
  const queryClient = useQueryClient();

  const [postToDelete, setPostToDelete] = useState<Post | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [postToEdit, setPostToEdit] = useState<Post | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: posts = [], isLoading } = useQuery<Post[]>({
    queryKey: ['admin-posts'],
    queryFn: async () => {
      const res = await axios.get(`${ADMIN_API_URL}/api/v1/posts/`);
      return res.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(`${ADMIN_API_URL}/api/v1/posts/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onSuccess: () => {
      toast.success('Post deleted successfully.');
      queryClient.invalidateQueries({ queryKey: ['admin-posts'] });
      setPostToDelete(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to delete post.');
      setPostToDelete(null);
    },
  });

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

  const filteredPosts = posts.filter((post) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;

    return (
      (post.title || '').toLowerCase().includes(q) ||
      (post.content || '').toLowerCase().includes(q) ||
      (post.platform || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Social Posts"
        description="Manage your professional social network posts and micro-blogs."
        actionLabel="Add Post"
        onAction={handleAdd}
      />

      {/* Controls: Search */}
      {posts.length > 0 && (
        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search posts..."
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
      ) : posts.length === 0 ? (
        <EmptyState
          icon={Share2}
          title="No posts added yet"
          message="Highlight your online presence by sharing links to your popular social media posts."
          actionLabel="Add Post"
          onAction={handleAdd}
        />
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filteredPosts.map((post) => (
            <div
              key={post.id}
              className="group relative flex flex-col justify-between rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
            >
              <div>
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <Share2
                      size={18}
                      className="shrink-0 text-cyan-500 dark:text-cyan-400"
                    />
                    <span className="rounded bg-cyan-50 px-2 py-0.5 font-mono text-[11px] font-semibold text-cyan-700 capitalize dark:bg-cyan-950/60 dark:text-cyan-300">
                      {post.platform || 'Social Post'}
                    </span>
                  </div>

                  <div className="flex shrink-0 items-center gap-1">
                    {post.url && (
                      <a
                        href={post.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-md p-1.5 text-gray-400 transition-colors hover:text-gray-700 dark:hover:text-gray-200"
                        title="View Original Post"
                      >
                        <ExternalLink size={15} />
                      </a>
                    )}
                    <button
                      onClick={() => handleEdit(post)}
                      className="cursor-pointer rounded-md p-1.5 text-gray-400 transition-colors hover:text-blue-600 dark:hover:text-blue-400"
                      title="Edit Post"
                    >
                      <Edit2 size={15} />
                    </button>
                    <button
                      onClick={() => setPostToDelete(post)}
                      className="cursor-pointer rounded-md p-1.5 text-gray-400 transition-colors hover:text-red-600 dark:hover:text-red-400"
                      title="Delete Post"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                <h3
                  className="mb-2 line-clamp-2 text-base font-bold text-gray-900 transition-colors group-hover:text-blue-600 dark:text-gray-100 dark:group-hover:text-blue-400"
                  title={post.title}
                >
                  {post.title}
                </h3>

                <p className="mb-4 text-xs leading-relaxed text-gray-600 dark:text-gray-400 line-clamp-3">
                  {post.content || 'No content preview.'}
                </p>
              </div>

              <div className="flex items-center justify-between border-t border-gray-100 pt-3 text-xs text-gray-500 dark:border-gray-800/80 dark:text-gray-400">
                {post.profile && (
                  <span className="font-mono text-[11px] text-gray-500 dark:text-gray-400">
                    @{post.profile}
                  </span>
                )}

                {post.created_at && (
                  <span className="flex items-center gap-1 font-mono text-[11px] text-gray-400">
                    <Calendar size={13} />
                    {new Date(post.created_at).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
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
