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
import { Education } from '../../../types';

const educationSchema = z.object({
  school: z.string().min(1, 'School is required'),
  degree: z.string().min(1, 'Degree is required'),
  field_of_study: z.string().optional(),
  start_date: z.string().min(1, 'Start date is required'),
  end_date: z.string().optional(),
  is_current: z.boolean().default(false),
  grade: z.string().optional(),
  description: z.string().optional(),
});

type EducationFormData = z.infer<typeof educationSchema>;

interface EducationFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  education?: Education | null;
}

export default function EducationFormModal({ isOpen, onClose, education }: EducationFormModalProps) {
  const { token } = useAuth();
  const { ADMIN_API_URL } = useEnv();
  const queryClient = useQueryClient();

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<EducationFormData>({
    resolver: zodResolver(educationSchema),
  });

  const isCurrent = watch('is_current');

  useEffect(() => {
    if (education && isOpen) {
      const formatDate = (dateString?: string) => dateString ? dateString.split('T')[0] : '';
      reset({
        school: education.school,
        degree: education.degree,
        field_of_study: education.field_of_study || '',
        start_date: formatDate(education.start_date),
        end_date: formatDate(education.end_date),
        is_current: education.is_current || false,
        grade: education.grade || '',
        description: education.description || '',
      });
    } else if (isOpen) {
      reset({
        school: '',
        degree: '',
        field_of_study: '',
        start_date: '',
        end_date: '',
        is_current: false,
        grade: '',
        description: '',
      });
    }
  }, [education, isOpen, reset]);

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      const url = education
        ? `${ADMIN_API_URL}/api/v1/educations/${education.id}`
        : `${ADMIN_API_URL}/api/v1/educations/`;
      const method = education ? 'put' : 'post';
      await axios({
        method,
        url,
        data,
        headers: { Authorization: `Bearer ${token}` }
      });
    },
    onSuccess: () => {
      toast.success(education ? 'Education updated!' : 'Education created!');
      queryClient.invalidateQueries({ queryKey: ['admin-educations'] });
      queryClient.invalidateQueries({ queryKey: ['home-data'] });
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to save education.');
    }
  });

  const onSubmit = (data: EducationFormData) => {
    const payload = {
      ...data,
      end_date: data.is_current ? null : (data.end_date || null),
      grade: data.grade || null,
      description: data.description || null,
    };
    saveMutation.mutate(payload);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={education ? 'Edit Education' : 'Add Education'}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">School / University</label>
          <input
            {...register('school')}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
            placeholder="Harvard University"
          />
          {errors.school && <p className="text-red-500 text-xs mt-1">{errors.school.message}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Degree</label>
            <input
              {...register('degree')}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
              placeholder="Bachelor of Science"
            />
            {errors.degree && <p className="text-red-500 text-xs mt-1">{errors.degree.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Field of Study</label>
            <input
              {...register('field_of_study')}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
              placeholder="Computer Science"
            />
            {errors.field_of_study && <p className="text-red-500 text-xs mt-1">{errors.field_of_study.message}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Grade / GPA</label>
          <input
            {...register('grade')}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
            placeholder="3.8/4.0"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Date</label>
            <input
              type="date"
              {...register('start_date')}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-colors [color-scheme:light] dark:[color-scheme:dark]"
            />
            {errors.start_date && <p className="text-red-500 text-xs mt-1">{errors.start_date.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End Date</label>
            <input
              type="date"
              disabled={isCurrent}
              {...register('end_date')}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-colors disabled:opacity-50 disabled:bg-gray-100 dark:disabled:bg-gray-900 [color-scheme:light] dark:[color-scheme:dark]"
            />
            {errors.end_date && <p className="text-red-500 text-xs mt-1">{errors.end_date.message}</p>}
          </div>
        </div>

        <div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              {...register('is_current')}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">I currently study here</span>
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
          <textarea
            {...register('description')}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-colors resize-none"
            placeholder="Describe your achievements, clubs, activities..."
          />
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
