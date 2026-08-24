import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import {
  Box,
  Download,
  Edit2,
  ExternalLink,
  PackageCheck,
  RefreshCw,
  Search,
  Tag,
  Trash2,
  X,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

import AdminPageHeader from '../../components/admin/AdminPageHeader';
import ConfirmDeleteModal from '../../components/admin/ConfirmDeleteModal';
import PackageFormModal from '../../components/admin/forms/PackageFormModal';
import { ContentCardSkeleton } from '../../components/ui/ContentCardSkeleton';
import EmptyState from '../../components/ui/EmptyState';
import { useAuth } from '../../context/AuthContext';
import { useEnv } from '../../hooks/useEnv';
import { Package } from '../../types';

export default function AdminPackages() {
  const { token } = useAuth();
  const { ADMIN_API_URL } = useEnv();
  const queryClient = useQueryClient();

  const [packageToDelete, setPackageToDelete] = useState<Package | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [packageToEdit, setPackageToEdit] = useState<Package | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [platformFilter, setPlatformFilter] = useState('ALL');

  const { data: packages = [], isLoading } = useQuery<Package[]>({
    queryKey: ['admin-packages'],
    queryFn: async () => {
      const res = await axios.get(`${ADMIN_API_URL}/api/v1/packages/`);
      return res.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(`${ADMIN_API_URL}/api/v1/packages/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onSuccess: () => {
      toast.success('Package deleted successfully.');
      queryClient.invalidateQueries({ queryKey: ['admin-packages'] });
      setPackageToDelete(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to delete package.');
      setPackageToDelete(null);
    },
  });

  const refreshMutation = useMutation({
    mutationFn: async () => {
      await axios.post(
        `${ADMIN_API_URL}/api/v1/packages/refresh`,
        { platform: 'all', package_names: [] },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    },
    onSuccess: () => {
      toast.success('Packages ingestion started in background.');
      queryClient.invalidateQueries({ queryKey: ['admin-packages'] });
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.detail || 'Failed to trigger packages refresh.'
      );
    },
  });

  const handleEdit = (p: Package) => {
    setPackageToEdit(p);
    setIsFormOpen(true);
  };

  const handleAdd = () => {
    setPackageToEdit(null);
    setIsFormOpen(true);
  };

  const confirmDelete = () => {
    if (packageToDelete) {
      deleteMutation.mutate(packageToDelete.id);
    }
  };

  const filteredPackages = packages.filter((pkg) => {
    const platform = (pkg.platform || '').toUpperCase();
    const matchesPlatform =
      platformFilter === 'ALL' || platform.includes(platformFilter);

    const q = searchQuery.trim().toLowerCase();
    if (!q) return matchesPlatform;

    return (
      matchesPlatform &&
      ((pkg.title || '').toLowerCase().includes(q) ||
        (pkg.name || '').toLowerCase().includes(q) ||
        (pkg.description || '').toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Packages"
        description="Manage your published PyPI and NPM software packages."
        actionLabel="Add Package"
        onAction={handleAdd}
        secondaryActionLabel={
          refreshMutation.isPending ? 'Refreshing...' : 'Refresh Packages'
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
      {packages.length > 0 && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search packages..."
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
            {['ALL', 'PYPI', 'NPM'].map((tab) => (
              <button
                key={tab}
                onClick={() => setPlatformFilter(tab)}
                className={`cursor-pointer rounded-md px-3 py-1 text-xs font-medium transition-all ${
                  platformFilter === tab
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
                }`}
              >
                {tab === 'ALL' ? 'All' : tab}
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
      ) : packages.length === 0 ? (
        <EmptyState
          icon={Box}
          title="No packages added yet"
          message="Showcase your library development by adding links to your NPM or PyPI packages."
          actionLabel="Add Package"
          onAction={handleAdd}
        />
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filteredPackages.map((pkg) => (
            <div
              key={pkg.id}
              className="group relative flex flex-col justify-between rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
            >
              <div>
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <Box
                      size={20}
                      className="shrink-0 text-purple-500 dark:text-purple-400"
                    />
                    <h3
                      className="truncate text-base font-bold text-gray-900 transition-colors group-hover:text-blue-600 dark:text-gray-100 dark:group-hover:text-blue-400"
                      title={pkg.title || pkg.name}
                    >
                      {pkg.title || pkg.name}
                    </h3>
                  </div>

                  <div className="flex shrink-0 items-center gap-1">
                    {pkg.url && (
                      <a
                        href={pkg.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-md p-1.5 text-gray-400 transition-colors hover:text-gray-700 dark:hover:text-gray-200"
                        title="View Registry Package"
                      >
                        <ExternalLink size={15} />
                      </a>
                    )}
                    <button
                      onClick={() => handleEdit(pkg)}
                      className="cursor-pointer rounded-md p-1.5 text-gray-400 transition-colors hover:text-blue-600 dark:hover:text-blue-400"
                      title="Edit Package"
                    >
                      <Edit2 size={15} />
                    </button>
                    <button
                      onClick={() => setPackageToDelete(pkg)}
                      className="cursor-pointer rounded-md p-1.5 text-gray-400 transition-colors hover:text-red-600 dark:hover:text-red-400"
                      title="Delete Package"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                <div className="mb-3 flex items-center gap-2">
                  <span className="rounded bg-purple-50 px-2 py-0.5 font-mono text-[11px] font-semibold text-purple-700 uppercase dark:bg-purple-950/60 dark:text-purple-300">
                    {pkg.platform}
                  </span>
                  {pkg.version && (
                    <span className="flex items-center gap-1 font-mono text-[11px] text-gray-500 dark:text-gray-400">
                      <Tag size={12} />
                      v{pkg.version}
                    </span>
                  )}
                </div>

                <p className="mb-4 text-xs leading-relaxed text-gray-600 dark:text-gray-400 line-clamp-3">
                  {pkg.description || 'No package description available.'}
                </p>
              </div>

              <div className="flex items-center justify-between border-t border-gray-100 pt-3 text-xs text-gray-500 dark:border-gray-800/80 dark:text-gray-400">
                <span className="flex items-center gap-1 font-mono text-[11px] text-gray-600 dark:text-gray-300">
                  <Download size={13} className="text-gray-400" />
                  {pkg.last_month_downloads !== undefined
                    ? `${pkg.last_month_downloads.toLocaleString()} downloads/mo`
                    : 'N/A downloads'}
                </span>

                <span className="flex items-center gap-1 font-mono text-[11px] text-emerald-600 dark:text-emerald-400">
                  <PackageCheck size={13} />
                  Active
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDeleteModal
        isOpen={!!packageToDelete}
        onClose={() => setPackageToDelete(null)}
        onConfirm={confirmDelete}
        title="Delete Package"
        message={`Are you sure you want to delete "${packageToDelete?.title}"? This action cannot be undone.`}
        isDeleting={deleteMutation.isPending}
      />

      <PackageFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        pkg={packageToEdit}
      />
    </div>
  );
}
