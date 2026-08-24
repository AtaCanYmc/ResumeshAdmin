import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Award } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useEnv } from '../../hooks/useEnv';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import DataTable from '../../components/admin/DataTable';
import ConfirmDeleteModal from '../../components/admin/ConfirmDeleteModal';
import CertificateFormModal from '../../components/admin/forms/CertificateFormModal';
import EmptyState from '../../components/ui/EmptyState';
import { TableSkeleton } from '../../components/ui/Skeletons';
import { Certificate } from '../../types';

export default function AdminCertificates() {
  const { token } = useAuth();
  const { ADMIN_API_URL } = useEnv();
  const queryClient = useQueryClient();
  const [certificateToDelete, setCertificateToDelete] = useState<Certificate | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [certificateToEdit, setCertificateToEdit] = useState<Certificate | null>(null);

  const { data: certificates = [], isLoading } = useQuery<Certificate[]>({
    queryKey: ['admin-certificates'],
    queryFn: async () => {
      const res = await axios.get(`${ADMIN_API_URL}/api/v1/certificates/`);
      return res.data;
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(`${ADMIN_API_URL}/api/v1/certificates/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
    },
    onSuccess: () => {
      toast.success('Certificate deleted successfully.');
      queryClient.invalidateQueries({ queryKey: ['admin-certificates'] });
      setCertificateToDelete(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to delete certificate.');
      setCertificateToDelete(null);
    }
  });

  const columns = [
    { header: 'Name', accessorKey: 'name', cell: (c: Certificate) => <span className="font-medium text-gray-900 dark:text-white">{c.name}</span> },
    { header: 'Issuer', accessorKey: 'issuing_organization' },
    { header: 'Issue Date', accessorKey: 'issue_date', cell: (c: Certificate) => c.issue_date ? new Date(c.issue_date).toLocaleDateString() : '-' },
    { header: 'Credential ID', accessorKey: 'credential_id', cell: (c: Certificate) => c.credential_id || '-' },
  ];

  const handleEdit = (certificate: Certificate) => {
    setCertificateToEdit(certificate);
    setIsFormOpen(true);
  };

  const handleAdd = () => {
    setCertificateToEdit(null);
    setIsFormOpen(true);
  };

  const confirmDelete = () => {
    if (certificateToDelete) {
      deleteMutation.mutate(certificateToDelete.id);
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Certificates"
        description="Manage your professional certificates and licenses."
        actionLabel="Add Certificate"
        onAction={handleAdd}
      />

      {isLoading ? (
        <TableSkeleton />
      ) : certificates.length === 0 ? (
        <EmptyState
          icon={Award}
          title="No certificates added yet"
          message="Display your certifications and credentials to stand out to employers."
          actionLabel="Add Certificate"
          onAction={handleAdd}
        />
      ) : (
        <DataTable
          data={certificates}
          columns={columns}
          keyExtractor={(c) => c.id}
          onEdit={handleEdit}
          onDelete={(c) => setCertificateToDelete(c)}
        />
      )}

      <ConfirmDeleteModal
        isOpen={!!certificateToDelete}
        onClose={() => setCertificateToDelete(null)}
        onConfirm={confirmDelete}
        title="Delete Certificate"
        message={`Are you sure you want to delete "${certificateToDelete?.name}"? This action cannot be undone.`}
        isDeleting={deleteMutation.isPending}
      />

      <CertificateFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        certificate={certificateToEdit}
      />
    </div>
  );
}
