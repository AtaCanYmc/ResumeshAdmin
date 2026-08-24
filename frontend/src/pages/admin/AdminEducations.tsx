import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { GraduationCap } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useEnv } from '../../hooks/useEnv';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import DataTable from '../../components/admin/DataTable';
import ConfirmDeleteModal from '../../components/admin/ConfirmDeleteModal';
import EducationFormModal from '../../components/admin/forms/EducationFormModal';
import EmptyState from '../../components/ui/EmptyState';
import { TableSkeleton } from '../../components/ui/Skeletons';
import { Education } from '../../types';

export default function AdminEducations() {
  const { token } = useAuth();
  const { ADMIN_API_URL } = useEnv();
  const queryClient = useQueryClient();
  const [educationToDelete, setEducationToDelete] = useState<Education | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [educationToEdit, setEducationToEdit] = useState<Education | null>(null);

  const { data: educations = [], isLoading } = useQuery<Education[]>({
    queryKey: ['admin-educations'],
    queryFn: async () => {
      const res = await axios.get(`${ADMIN_API_URL}/api/v1/educations/`);
      return res.data;
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(`${ADMIN_API_URL}/api/v1/educations/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
    },
    onSuccess: () => {
      toast.success('Education deleted successfully.');
      queryClient.invalidateQueries({ queryKey: ['admin-educations'] });
      setEducationToDelete(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to delete education.');
      setEducationToDelete(null);
    }
  });

  const columns = [
    { header: 'School', accessorKey: 'school', cell: (e: Education) => <span className="font-medium text-gray-900 dark:text-white">{e.school}</span> },
    { header: 'Degree', accessorKey: 'degree' },
    { header: 'Field of Study', accessorKey: 'field_of_study' },
    { header: 'Start Date', accessorKey: 'start_date', cell: (e: Education) => new Date(e.start_date).toLocaleDateString() },
  ];

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

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Educations"
        description="Manage your academic education and history."
        actionLabel="Add Education"
        onAction={handleAdd}
      />

      {isLoading ? (
        <TableSkeleton />
      ) : educations.length === 0 ? (
        <EmptyState
          icon={GraduationCap}
          title="No educations added yet"
          message="Keep track of your academic milestones and degrees in your profile."
          actionLabel="Add Education"
          onAction={handleAdd}
        />
      ) : (
        <DataTable
          data={educations}
          columns={columns}
          keyExtractor={(e) => e.id}
          onEdit={handleEdit}
          onDelete={(e) => setEducationToDelete(e)}
        />
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
