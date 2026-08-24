import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import {
  Award,
  Calendar,
  CheckCircle2,
  Edit2,
  ExternalLink,
  Search,
  ShieldCheck,
  Trash2,
  X,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

import AdminPageHeader from '../../components/admin/AdminPageHeader';
import ConfirmDeleteModal from '../../components/admin/ConfirmDeleteModal';
import CertificateFormModal from '../../components/admin/forms/CertificateFormModal';
import { ContentCardSkeleton } from '../../components/ui/ContentCardSkeleton';
import EmptyState from '../../components/ui/EmptyState';
import { useAuth } from '../../context/AuthContext';
import { useEnv } from '../../hooks/useEnv';
import { Certificate } from '../../types';

export default function AdminCertificates() {
  const { token } = useAuth();
  const { ADMIN_API_URL } = useEnv();
  const queryClient = useQueryClient();

  const [certificateToDelete, setCertificateToDelete] =
    useState<Certificate | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [certificateToEdit, setCertificateToEdit] =
    useState<Certificate | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: certificates = [], isLoading } = useQuery<Certificate[]>({
    queryKey: ['admin-certificates'],
    queryFn: async () => {
      const res = await axios.get(`${ADMIN_API_URL}/api/v1/certificates/`);
      return res.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(`${ADMIN_API_URL}/api/v1/certificates/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onSuccess: () => {
      toast.success('Certificate deleted successfully.');
      queryClient.invalidateQueries({ queryKey: ['admin-certificates'] });
      setCertificateToDelete(null);
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.detail || 'Failed to delete certificate.'
      );
      setCertificateToDelete(null);
    },
  });

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

  const filteredCertificates = certificates.filter((cert) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;

    return (
      (cert.name || '').toLowerCase().includes(q) ||
      (cert.issuing_organization || cert.issuer || '').toLowerCase().includes(q) ||
      (cert.credential_id || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Certificates"
        description="Manage your professional certificates and licenses."
        actionLabel="Add Certificate"
        onAction={handleAdd}
      />

      {/* Controls: Search */}
      {certificates.length > 0 && (
        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search certificates..."
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
      ) : certificates.length === 0 ? (
        <EmptyState
          icon={Award}
          title="No certificates added yet"
          message="Display your certifications and credentials to stand out to employers."
          actionLabel="Add Certificate"
          onAction={handleAdd}
        />
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filteredCertificates.map((cert) => (
            <div
              key={cert.id}
              className="group relative flex flex-col justify-between rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
            >
              <div>
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <Award
                      size={20}
                      className="shrink-0 text-amber-500 dark:text-amber-400"
                    />
                    <h3
                      className="truncate text-base font-bold text-gray-900 transition-colors group-hover:text-blue-600 dark:text-gray-100 dark:group-hover:text-blue-400"
                      title={cert.name}
                    >
                      {cert.name}
                    </h3>
                  </div>

                  <div className="flex shrink-0 items-center gap-1">
                    {(cert.credential_url || cert.url) && (
                      <a
                        href={cert.credential_url || cert.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-md p-1.5 text-gray-400 transition-colors hover:text-gray-700 dark:hover:text-gray-200"
                        title="View Credential"
                      >
                        <ExternalLink size={15} />
                      </a>
                    )}
                    <button
                      onClick={() => handleEdit(cert)}
                      className="cursor-pointer rounded-md p-1.5 text-gray-400 transition-colors hover:text-blue-600 dark:hover:text-blue-400"
                      title="Edit Certificate"
                    >
                      <Edit2 size={15} />
                    </button>
                    <button
                      onClick={() => setCertificateToDelete(cert)}
                      className="cursor-pointer rounded-md p-1.5 text-gray-400 transition-colors hover:text-red-600 dark:hover:text-red-400"
                      title="Delete Certificate"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                <div className="mb-3 flex items-center gap-1.5 text-xs text-gray-700 dark:text-gray-300">
                  <ShieldCheck size={14} className="text-gray-400" />
                  <span className="font-semibold text-gray-900 dark:text-gray-100">
                    {cert.issuing_organization || cert.issuer || 'Issuer Organization'}
                  </span>
                </div>

                {cert.credential_id && (
                  <p className="mb-4 font-mono text-[11px] text-gray-500 dark:text-gray-400">
                    ID: {cert.credential_id}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between border-t border-gray-100 pt-3 text-xs text-gray-500 dark:border-gray-800/80 dark:text-gray-400">
                <span className="flex items-center gap-1 font-mono text-[11px]">
                  <Calendar size={13} className="text-gray-400" />
                  {cert.issue_date
                    ? new Date(cert.issue_date).toLocaleDateString()
                    : 'Issued'}
                </span>

                <span className="flex items-center gap-1 font-mono text-[11px] text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 size={13} />
                  Verified
                </span>
              </div>
            </div>
          ))}
        </div>
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
