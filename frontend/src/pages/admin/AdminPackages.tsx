import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Box, RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useEnv } from '../../hooks/useEnv';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import DataTable from '../../components/admin/DataTable';
import ConfirmDeleteModal from '../../components/admin/ConfirmDeleteModal';
import PackageFormModal from '../../components/admin/forms/PackageFormModal';
import EmptyState from '../../components/ui/EmptyState';
import { TableSkeleton } from '../../components/ui/Skeletons';
import { Package } from '../../types';

export default function AdminPackages() {
  const { token } = useAuth();
  const { ADMIN_API_URL } = useEnv();
  const queryClient = useQueryClient();
  const [packageToDelete, setPackageToDelete] = useState<Package | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [packageToEdit, setPackageToEdit] = useState<Package | null>(null);

  const { data: packages = [], isLoading } = useQuery<Package[]>({
    queryKey: ['admin-packages'],
    queryFn: async () => {
      const res = await axios.get(
        `${ADMIN_API_URL}/api/v1/packages/`
      );
      return res.data;
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(
        `${ADMIN_API_URL}/api/v1/packages/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
    },
    onSuccess: () => {
      toast.success('Package deleted successfully.');
      queryClient.invalidateQueries({ queryKey: ['admin-packages'] });
      setPackageToDelete(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to delete package.');
      setPackageToDelete(null);
    }
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
      toast.error(error.response?.data?.detail || 'Failed to trigger packages refresh.');
    }
  });

  const columns = [
    {
      header: 'Title',
      accessorKey: 'title',
      cell: (p: Package) => (
        <span className="font-medium text-gray-900 dark:text-white">{p.title}</span>
      )
    },
    {
      header: 'Platform',
      accessorKey: 'platform',
      cell: (p: Package) => <span className="uppercase text-xs font-semibold">{p.platform}</span>
    },
    {
      header: 'Version',
      accessorKey: 'version',
      cell: (p: Package) => p.version || '-'
    },
    {
      header: 'Monthly Downloads',
      accessorKey: 'last_month_downloads',
      cell: (p: Package) => (p.last_month_downloads !== undefined ? p.last_month_downloads.toLocaleString() : '-')
    },
    {
      header: 'Url',
      accessorKey: 'url',
      cell: (p: Package) =>
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

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Packages"
        description="Manage your published PyPI and NPM software packages."
        actionLabel="Add Package"
        onAction={handleAdd}
        secondaryActionLabel={refreshMutation.isPending ? "Refreshing..." : "Refresh Packages"}
        secondaryActionIcon={<RefreshCw size={18} className={refreshMutation.isPending ? "animate-spin" : ""} />}
        onSecondaryAction={() => refreshMutation.mutate()}
        isSecondaryPending={refreshMutation.isPending}
      />

      {isLoading ? (
        <TableSkeleton />
      ) : packages.length === 0 ? (
        <EmptyState
          icon={Box}
          title="No packages added yet"
          message="Showcase your library development by adding links to your NPM or PyPI packages."
          actionLabel="Add Package"
          onAction={handleAdd}
        />
      ) : (
        <DataTable
          data={packages}
          columns={columns}
          keyExtractor={(p) => p.id}
          onEdit={handleEdit}
          onDelete={(p) => setPackageToDelete(p)}
        />
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
