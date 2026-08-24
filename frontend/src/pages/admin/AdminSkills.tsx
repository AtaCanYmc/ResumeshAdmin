import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Wand2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useEnv } from '../../hooks/useEnv';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import DataTable from '../../components/admin/DataTable';
import ConfirmDeleteModal from '../../components/admin/ConfirmDeleteModal';
import SkillFormModal from '../../components/admin/forms/SkillFormModal';
import EmptyState from '../../components/ui/EmptyState';
import { TableSkeleton } from '../../components/ui/Skeletons';
import { Skill } from '../../types';

export default function AdminSkills() {
  const { token } = useAuth();
  const { ADMIN_API_URL } = useEnv();
  const queryClient = useQueryClient();
  const [skillToDelete, setSkillToDelete] = useState<Skill | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [skillToEdit, setSkillToEdit] = useState<Skill | null>(null);

  const { data: skills = [], isLoading } = useQuery<Skill[]>({
    queryKey: ['admin-skills'],
    queryFn: async () => {
      const res = await axios.get(`${ADMIN_API_URL}/api/v1/skills/`);
      return res.data;
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(`${ADMIN_API_URL}/api/v1/skills/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
    },
    onSuccess: () => {
      toast.success('Skill deleted successfully.');
      queryClient.invalidateQueries({ queryKey: ['admin-skills'] });
      setSkillToDelete(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to delete skill.');
      setSkillToDelete(null);
    }
  });

  const columns = [
    { header: 'Name', accessorKey: 'name', cell: (s: Skill) => <span className="font-medium text-gray-900 dark:text-white">{s.name}</span> },
    { header: 'Category', accessorKey: 'category', cell: (s: Skill) => <span className="capitalize">{s.category}</span> },
    { header: 'Icon Name', accessorKey: 'icon_name', cell: (s: Skill) => <span>{s.icon_name || '-'}</span> },
  ];

  const handleEdit = (skill: Skill) => {
    setSkillToEdit(skill);
    setIsFormOpen(true);
  };

  const handleAdd = () => {
    setSkillToEdit(null);
    setIsFormOpen(true);
  };

  const confirmDelete = () => {
    if (skillToDelete) {
      deleteMutation.mutate(skillToDelete.id as any);
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Skills"
        description="Manage your skills and categorize them."
        actionLabel="Add Skill"
        onAction={handleAdd}
      />

      {isLoading ? (
        <TableSkeleton />
      ) : skills.length === 0 ? (
        <EmptyState
          icon={Wand2}
          title="No skills added yet"
          message="Showcase your tech stack and expertise by listing your main skills."
          actionLabel="Add Skill"
          onAction={handleAdd}
        />
      ) : (
        <DataTable
          data={skills}
          columns={columns}
          keyExtractor={(s) => s.id}
          onEdit={handleEdit}
          onDelete={(s) => setSkillToDelete(s)}
        />
      )}

      <ConfirmDeleteModal
        isOpen={!!skillToDelete}
        onClose={() => setSkillToDelete(null)}
        onConfirm={confirmDelete}
        title="Delete Skill"
        message={`Are you sure you want to delete "${skillToDelete?.name}"? This action cannot be undone.`}
        isDeleting={deleteMutation.isPending}
      />

      <SkillFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        skill={skillToEdit}
      />
    </div>
  );
}
