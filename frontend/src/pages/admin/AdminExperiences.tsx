import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Briefcase } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useEnv } from '../../hooks/useEnv';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import DataTable from '../../components/admin/DataTable';
import ConfirmDeleteModal from '../../components/admin/ConfirmDeleteModal';
import ExperienceFormModal from '../../components/admin/forms/ExperienceFormModal';
import EmptyState from '../../components/ui/EmptyState';
import { TableSkeleton } from '../../components/ui/Skeletons';
import { Experience } from '../../types';

export default function AdminExperiences() {
  const { token } = useAuth();
  const { ADMIN_API_URL } = useEnv();
  const queryClient = useQueryClient();
  const [experienceToDelete, setExperienceToDelete] = useState<Experience | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [experienceToEdit, setExperienceToEdit] = useState<Experience | null>(null);

  const { data: experiences = [], isLoading } = useQuery<Experience[]>({
    queryKey: ['admin-experiences'],
    queryFn: async () => {
      const res = await axios.get(`${ADMIN_API_URL}/api/v1/experiences/`);
      return res.data;
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(`${ADMIN_API_URL}/api/v1/experiences/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
    },
    onSuccess: () => {
      toast.success('Experience deleted successfully.');
      queryClient.invalidateQueries({ queryKey: ['admin-experiences'] });
      setExperienceToDelete(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to delete experience.');
      setExperienceToDelete(null);
    }
  });

  const columns = [
    { header: 'Title', accessorKey: 'title', cell: (e: Experience) => <span className="font-medium text-gray-900 dark:text-white">{e.title}</span> },
    { header: 'Company', accessorKey: 'company_name' },
    { header: 'Location', accessorKey: 'location' },
    { header: 'Start Date', accessorKey: 'start_date', cell: (e: Experience) => new Date(e.start_date).toLocaleDateString() },
  ];

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

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Experiences"
        description="Manage your work experience and career history."
        actionLabel="Add Experience"
        onAction={handleAdd}
      />

      {isLoading ? (
        <TableSkeleton />
      ) : experiences.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No experiences added yet"
          message="Enhance your resume by adding your professional work experiences and internships."
          actionLabel="Add Experience"
          onAction={handleAdd}
        />
      ) : (
        <DataTable
          data={experiences}
          columns={columns}
          keyExtractor={(e) => e.id}
          onEdit={handleEdit}
          onDelete={(e) => setExperienceToDelete(e)}
        />
      )}

      <ConfirmDeleteModal
        isOpen={!!experienceToDelete}
        onClose={() => setExperienceToDelete(null)}
        onConfirm={confirmDelete}
        title="Delete Experience"
        message={`Are you sure you want to delete "${experienceToDelete?.title} at ${experienceToDelete?.company_name}"? This action cannot be undone.`}
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
