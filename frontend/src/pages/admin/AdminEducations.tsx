import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import {
  Award,
  Calendar,
  Edit2,
  GraduationCap,
  School,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

import AdminPageHeader from '../../components/admin/AdminPageHeader';
import ConfirmDeleteModal from '../../components/admin/ConfirmDeleteModal';
import EducationFormModal from '../../components/admin/forms/EducationFormModal';
import { ContentCardSkeleton } from '../../components/ui/ContentCardSkeleton';
import EmptyState from '../../components/ui/EmptyState';
import { useAuth } from '../../context/AuthContext';
import { useEnv } from '../../hooks/useEnv';
import { Education } from '../../types';

export default function AdminEducations() {
  const { token } = useAuth();
  const { ADMIN_API_URL } = useEnv();
  const queryClient = useQueryClient();

  const [educationToDelete, setEducationToDelete] =
    useState<Education | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [educationToEdit, setEducationToEdit] = useState<Education | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState('');

  const { data: educations = [], isLoading } = useQuery<Education[]>({
    queryKey: ['admin-educations'],
    queryFn: async () => {
      const res = await axios.get(`${ADMIN_API_URL}/api/v1/educations/`);
      return res.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(`${ADMIN_API_URL}/api/v1/educations/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onSuccess: () => {
      toast.success('Education deleted successfully.');
      queryClient.invalidateQueries({ queryKey: ['admin-educations'] });
      setEducationToDelete(null);
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.detail || 'Failed to delete education.'
      );
      setEducationToDelete(null);
    },
  });

  const handleEdit = (education: Education) => {
    setEducationToEdit(education);
    setIsFormOpen(true);
  };

  const handleAdd = () => {
    setEducationToEdit(null);
    setIsFormOpen(true);
  };

  const confirmDelete = () => {
    if (educationToDelete) {
      deleteMutation.mutate(educationToDelete.id);
    }
  };

  const filteredEducations = educations.filter((edu) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;

    return (
      (edu.school || '').toLowerCase().includes(q) ||
      (edu.degree || '').toLowerCase().includes(q) ||
      (edu.field_of_study || '').toLowerCase().includes(q) ||
      (edu.description || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Educations"
        description="Manage your academic education and history."
        actionLabel="Add Education"
        onAction={handleAdd}
      />

      {/* Controls: Search */}
      {educations.length > 0 && (
        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search educations..."
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
      ) : educations.length === 0 ? (
        <EmptyState
          icon={GraduationCap}
          title="No educations added yet"
          message="Keep track of your academic milestones and degrees in your profile."
          actionLabel="Add Education"
          onAction={handleAdd}
        />
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filteredEducations.map((edu) => (
            <div
              key={edu.id}
              className="group relative flex flex-col justify-between rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
            >
              <div>
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <GraduationCap
                      size={20}
                      className="shrink-0 text-emerald-500 dark:text-emerald-400"
                    />
                    <h3
                      className="truncate text-base font-bold text-gray-900 transition-colors group-hover:text-blue-600 dark:text-gray-100 dark:group-hover:text-blue-400"
                      title={edu.school}
                    >
                      {edu.school}
                    </h3>
                  </div>

                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      onClick={() => handleEdit(edu)}
                      className="cursor-pointer rounded-md p-1.5 text-gray-400 transition-colors hover:text-blue-600 dark:hover:text-blue-400"
                      title="Edit Education"
                    >
                      <Edit2 size={15} />
                    </button>
                    <button
                      onClick={() => setEducationToDelete(edu)}
                      className="cursor-pointer rounded-md p-1.5 text-gray-400 transition-colors hover:text-red-600 dark:hover:text-red-400"
                      title="Delete Education"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                <div className="mb-3">
                  <span className="inline-block rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                    {edu.degree} {edu.field_of_study ? `- ${edu.field_of_study}` : ''}
                  </span>
                </div>

                <p className="mb-4 text-xs leading-relaxed text-gray-600 dark:text-gray-400 line-clamp-3">
                  {edu.description || 'No additional details provided.'}
                </p>
              </div>

              <div className="flex items-center justify-between border-t border-gray-100 pt-3 text-xs text-gray-500 dark:border-gray-800/80 dark:text-gray-400">
                <span className="flex items-center gap-1 font-mono text-[11px]">
                  <Calendar size={13} className="text-gray-400" />
                  {edu.start_date
                    ? new Date(edu.start_date).getFullYear()
                    : ''}{' '}
                  -{' '}
                  {edu.is_current
                    ? 'Present'
                    : edu.end_date
                    ? new Date(edu.end_date).getFullYear()
                    : 'Present'}
                </span>

                {edu.grade && (
                  <span className="flex items-center gap-1 font-mono text-[11px] font-medium text-amber-600 dark:text-amber-400">
                    <Award size={13} />
                    GPA: {edu.grade}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDeleteModal
        isOpen={!!educationToDelete}
        onClose={() => setEducationToDelete(null)}
        onConfirm={confirmDelete}
        title="Delete Education"
        message={`Are you sure you want to delete "${educationToDelete?.degree} at ${educationToDelete?.school}"? This action cannot be undone.`}
        isDeleting={deleteMutation.isPending}
      />

      <EducationFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        education={educationToEdit}
      />
    </div>
  );
}
