import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import {
  Briefcase,
  Building2,
  Calendar,
  Edit2,
  MapPin,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

import AdminPageHeader from '../../components/admin/AdminPageHeader';
import ConfirmDeleteModal from '../../components/admin/ConfirmDeleteModal';
import ExperienceFormModal from '../../components/admin/forms/ExperienceFormModal';
import { ContentCardSkeleton } from '../../components/ui/ContentCardSkeleton';
import EmptyState from '../../components/ui/EmptyState';
import { useAuth } from '../../context/AuthContext';
import { useEnv } from '../../hooks/useEnv';
import { Experience } from '../../types';

function formatDate(dateStr?: string): string {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) {
      return dateStr;
    }
    return d.toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

export default function AdminExperiences() {
  const { token } = useAuth();
  const { ADMIN_API_URL } = useEnv();
  const queryClient = useQueryClient();

  const [experienceToDelete, setExperienceToDelete] =
    useState<Experience | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [experienceToEdit, setExperienceToEdit] = useState<Experience | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState('');

  const { data: experiences = [], isLoading } = useQuery<Experience[]>({
    queryKey: ['admin-experiences'],
    queryFn: async () => {
      const res = await axios.get(`${ADMIN_API_URL}/api/v1/experiences/`);
      return res.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(`${ADMIN_API_URL}/api/v1/experiences/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onSuccess: () => {
      toast.success('Experience deleted successfully.');
      queryClient.invalidateQueries({ queryKey: ['admin-experiences'] });
      setExperienceToDelete(null);
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.detail || 'Failed to delete experience.'
      );
      setExperienceToDelete(null);
    },
  });

  const handleEdit = (experience: Experience) => {
    setExperienceToEdit(experience);
    setIsFormOpen(true);
  };

  const handleAdd = () => {
    setExperienceToEdit(null);
    setIsFormOpen(true);
  };

  const confirmDelete = () => {
    if (experienceToDelete) {
      deleteMutation.mutate(experienceToDelete.id);
    }
  };

  const filteredExperiences = experiences.filter((exp) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;

    return (
      (exp.title || '').toLowerCase().includes(q) ||
      (exp.company_name || (exp as any).company || '').toLowerCase().includes(q) ||
      (exp.location || '').toLowerCase().includes(q) ||
      (exp.description || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Experiences"
        description="Manage your work experience and career history."
        actionLabel="Add Experience"
        onAction={handleAdd}
      />

      {/* Controls: Search */}
      {experiences.length > 0 && (
        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search experiences..."
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
      ) : experiences.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No experiences added yet"
          message="Enhance your resume by adding your professional work experiences and internships."
          actionLabel="Add Experience"
          onAction={handleAdd}
        />
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filteredExperiences.map((exp) => (
            <div
              key={exp.id}
              className="group relative flex flex-col justify-between rounded-xl border border-gray-200 bg-white p-5 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
            >
              <div>
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <Briefcase
                      size={18}
                      className="shrink-0 text-indigo-500 dark:text-indigo-400"
                    />
                    <h3
                      className="truncate text-base font-bold text-gray-900 transition-colors group-hover:text-blue-600 dark:text-gray-100 dark:group-hover:text-blue-400"
                      title={exp.title}
                    >
                      {exp.title}
                    </h3>
                  </div>

                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      onClick={() => handleEdit(exp)}
                      className="cursor-pointer rounded-md p-1.5 text-gray-400 transition-colors hover:text-blue-600 dark:hover:text-blue-400"
                      title="Edit Experience"
                    >
                      <Edit2 size={15} />
                    </button>
                    <button
                      onClick={() => setExperienceToDelete(exp)}
                      className="cursor-pointer rounded-md p-1.5 text-gray-400 transition-colors hover:text-red-600 dark:hover:text-red-400"
                      title="Delete Experience"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-700 dark:text-gray-300">
                  <span className="flex items-center gap-1 font-semibold text-gray-900 dark:text-gray-100">
                    <Building2 size={13} className="text-gray-400" />
                    {exp.company_name || (exp as any).company || 'Company'}
                  </span>
                  {exp.location && (
                    <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                      <MapPin size={13} />
                      {exp.location}
                    </span>
                  )}
                </div>

                <p className="mb-4 text-xs leading-relaxed text-gray-600 dark:text-gray-400 line-clamp-4">
                  {exp.description || 'No description provided.'}
                </p>
              </div>

              <div className="flex items-center justify-between border-t border-gray-100 pt-3 text-xs text-gray-500 dark:border-gray-800/80 dark:text-gray-400">
                <span className="flex items-center gap-1 font-mono text-[11px]">
                  <Calendar size={13} className="text-gray-400" />
                  {formatDate(exp.start_date)}
                  {(exp.start_date || exp.end_date || (exp as any).is_current) && ' - '}
                  {(exp as any).is_current
                    ? 'Present'
                    : exp.end_date
                    ? formatDate(exp.end_date)
                    : 'Present'}
                </span>

                {(exp as any).employment_type && (
                  <span className="rounded bg-gray-100 px-2 py-0.5 font-mono text-[11px] text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                    {(exp as any).employment_type}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDeleteModal
        isOpen={!!experienceToDelete}
        onClose={() => setExperienceToDelete(null)}
        onConfirm={confirmDelete}
        title="Delete Experience"
        message={`Are you sure you want to delete "${experienceToDelete?.title} at ${
          experienceToDelete?.company_name || (experienceToDelete as any)?.company
        }"? This action cannot be undone.`}
        isDeleting={deleteMutation.isPending}
      />

      <ExperienceFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        experience={experienceToEdit}
      />
    </div>
  );
}
