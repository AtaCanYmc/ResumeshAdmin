import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../../context/AuthContext';
import { useEnv } from '../../../hooks/useEnv';
import Modal from '../../Modal';
import { Skill } from '../../../types';

const schema = z.object({
  name: z.string().min(1, 'Skill name is required'),
  category: z.string().min(1, 'Category is required'),
  icon_name: z.string().optional(),
});

type SkillFormData = z.infer<typeof schema>;

interface SkillFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  skill?: Skill | null;
}

export default function SkillFormModal({ isOpen, onClose, skill }: SkillFormModalProps) {
  const { token } = useAuth();
  const { ADMIN_API_URL } = useEnv();
  const queryClient = useQueryClient();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<SkillFormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (skill) {
      reset({
        name: skill.name,
        category: skill.category,
        icon_name: skill.icon_name || '',
      });
    } else {
      reset({
        name: '',
        category: 'Backend',
        icon_name: '',
      });
    }
  }, [skill, isOpen, reset]);

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      const url = skill
        ? `${ADMIN_API_URL}/api/v1/skills/${skill.id}`
        : `${ADMIN_API_URL}/api/v1/skills/`;
      const method = skill ? 'put' : 'post';
      await axios({
        method,
        url,
        data,
        headers: { Authorization: `Bearer ${token}` }
      });
    },
    onSuccess: () => {
      toast.success(skill ? 'Skill updated!' : 'Skill created!');
      queryClient.invalidateQueries({ queryKey: ['admin-skills'] });
      queryClient.invalidateQueries({ queryKey: ['home-data'] });
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to save skill.');
    }
  });

  const onSubmit = (data: SkillFormData) => {
    saveMutation.mutate(data);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={skill ? 'Edit Skill' : 'Add Skill'}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
          <input
            {...register('name')}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
            placeholder="e.g. React"
          />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
          <input
            {...register('category')}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
            placeholder="e.g. Frontend"
          />
          {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Icon Name (Optional)</label>
          <input
            {...register('icon_name')}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
            placeholder="e.g. react"
          />
          {errors.icon_name && <p className="text-red-500 text-xs mt-1">{errors.icon_name.message}</p>}
        </div>

        <div className="pt-4 flex justify-end gap-3 border-t border-gray-200 dark:border-gray-800 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors focus:outline-none"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saveMutation.isPending}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-50"
          >
            {saveMutation.isPending ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
