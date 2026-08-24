import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import {
  ChevronDown,
  Code2,
  Edit2,
  Search,
  Sparkles,
  Trash2,
  Wand2,
  X,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

import AdminPageHeader from '../../components/admin/AdminPageHeader';
import ConfirmDeleteModal from '../../components/admin/ConfirmDeleteModal';
import SkillFormModal from '../../components/admin/forms/SkillFormModal';
import { ContentCardSkeleton } from '../../components/ui/ContentCardSkeleton';
import EmptyState from '../../components/ui/EmptyState';
import { useAuth } from '../../context/AuthContext';
import { useEnv } from '../../hooks/useEnv';
import { Skill } from '../../types';

export default function AdminSkills() {
  const { token } = useAuth();
  const { ADMIN_API_URL } = useEnv();
  const queryClient = useQueryClient();

  const [skillToDelete, setSkillToDelete] = useState<Skill | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [skillToEdit, setSkillToEdit] = useState<Skill | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  const { data: skills = [], isLoading } = useQuery<Skill[]>({
    queryKey: ['admin-skills'],
    queryFn: async () => {
      const res = await axios.get(`${ADMIN_API_URL}/api/v1/skills/`);
      return res.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(`${ADMIN_API_URL}/api/v1/skills/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
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
    },
  });

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

  // Categories
  const categories = Array.from(
    new Set(skills.map((s) => s.category).filter(Boolean))
  );

  const filteredSkills = skills.filter((skill) => {
    const matchesCategory =
      categoryFilter === 'All' ||
      (skill.category || '').toLowerCase() === categoryFilter.toLowerCase();
    const q = searchQuery.trim().toLowerCase();
    if (!q) return matchesCategory;

    return (
      matchesCategory &&
      ((skill.name || '').toLowerCase().includes(q) ||
        (skill.category || '').toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Skills"
        description="Manage your skills and categorize them."
        actionLabel="Add Skill"
        onAction={handleAdd}
      />

      {/* Controls: Search & Category Filter */}
      {skills.length > 0 && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search skills..."
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

          {categories.length > 0 && (
            <div className="relative w-full sm:w-48">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full cursor-pointer appearance-none rounded-lg border border-gray-200 bg-white py-2 pl-3 pr-8 text-xs text-gray-700 capitalize focus:border-blue-500 focus:outline-none dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300"
              >
                <option value="All">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={14}
                className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
            </div>
          )}
        </div>
      )}

      {/* Grid Layout */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, idx) => (
            <ContentCardSkeleton key={idx} />
          ))}
        </div>
      ) : skills.length === 0 ? (
        <EmptyState
          icon={Wand2}
          title="No skills added yet"
          message="Showcase your tech stack and expertise by listing your main skills."
          actionLabel="Add Skill"
          onAction={handleAdd}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filteredSkills.map((skill) => (
            <div
              key={skill.id}
              className="group relative flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
            >
              <div className="flex items-center gap-3 min-w-0 pr-2">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-gray-100 bg-blue-50/50 text-blue-600 dark:border-gray-800 dark:bg-gray-800/60 dark:text-blue-400">
                  <Code2 size={20} />
                </div>
                <div className="min-w-0">
                  <h3
                    className="truncate text-sm font-bold text-gray-900 transition-colors group-hover:text-blue-600 dark:text-gray-100 dark:group-hover:text-blue-400"
                    title={skill.name}
                  >
                    {skill.name}
                  </h3>
                  <span className="inline-block font-mono text-[11px] text-gray-500 capitalize dark:text-gray-400">
                    {skill.category || 'General'}
                  </span>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-1">
                <button
                  onClick={() => handleEdit(skill)}
                  className="cursor-pointer rounded-md p-1.5 text-gray-400 transition-colors hover:text-blue-600 dark:hover:text-blue-400"
                  title="Edit Skill"
                >
                  <Edit2 size={14} />
                </button>
                <button
                  onClick={() => setSkillToDelete(skill)}
                  className="cursor-pointer rounded-md p-1.5 text-gray-400 transition-colors hover:text-red-600 dark:hover:text-red-400"
                  title="Delete Skill"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
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
