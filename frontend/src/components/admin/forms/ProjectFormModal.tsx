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
import { Project } from '../../../types';

const schema = z.object({
  name: z.string().min(1, 'Project name is required'),
  title: z.string().optional(),
  description: z.string().optional(),
  url: z.string().url('Must be a valid URL').or(z.literal('')).optional(),
  languages: z.string().optional(),
  tags: z.string().optional(),
});

type ProjectFormData = z.infer<typeof schema>;

interface ProjectFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  project?: Project | null;
}

export default function ProjectFormModal({ isOpen, onClose, project }: ProjectFormModalProps) {
  const { token } = useAuth();
  const { ADMIN_API_URL } = useEnv();
  const queryClient = useQueryClient();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ProjectFormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (project) {
      reset({
        name: project.name || project.title || '',
        title: project.title || project.name || '',
        description: project.description || '',
        url: project.url || '',
        languages: Array.isArray(project.languages) ? project.languages.join(', ') : '',
        tags: Array.isArray(project.tags) ? project.tags.join(', ') : '',
      });
    } else {
      reset({
        name: '',
        title: '',
        description: '',
        url: '',
        languages: '',
        tags: '',
      });
    }
  }, [project, isOpen, reset]);

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      const url = project
        ? `${ADMIN_API_URL}/api/v1/projects/${project.id}`
        : `${ADMIN_API_URL}/api/v1/projects/`;
      const method = project ? 'put' : 'post';
      await axios({
        method,
        url,
        data,
        headers: { Authorization: `Bearer ${token}` }
      });
    },
    onSuccess: () => {
      toast.success(project ? 'Project updated!' : 'Project created!');
      queryClient.invalidateQueries({ queryKey: ['admin-projects'] });
      queryClient.invalidateQueries({ queryKey: ['home-data'] });
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to save project.');
    }
  });

  const onSubmit = (data: ProjectFormData) => {
    const payload = {
      ...data,
      title: data.name,
      url: data.url || null,
      languages: data.languages
        ? data.languages
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
        : [],
      tags: data.tags
        ? data.tags
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
        : [],
    };
    saveMutation.mutate(payload);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={project ? 'Edit Project' : 'Add Project'}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Project Name
          </label>
          <input
            {...register('name')}
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 transition-colors outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            placeholder="e.g. ResuMesh"
          />
          {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Description
          </label>
          <textarea
            {...register('description')}
            rows={3}
            className="w-full resize-none rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 transition-colors outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            placeholder="A brief description of the project..."
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            GitHub URL
          </label>
          <input
            {...register('url')}
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 transition-colors outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            placeholder="https://github.com/..."
          />
          {errors.url && <p className="mt-1 text-xs text-red-500">{errors.url.message}</p>}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Languages (comma separated)
            </label>
            <input
              {...register('languages')}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 transition-colors outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              placeholder="React, TypeScript, Go"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Tags (comma separated)
            </label>
            <input
              {...register('tags')}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 transition-colors outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              placeholder="frontend, ui, library"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3 border-t border-gray-200 pt-4 dark:border-gray-800">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-gray-600 transition-colors hover:bg-gray-100 focus:outline-none dark:text-gray-400 dark:hover:bg-gray-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saveMutation.isPending}
            className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-50"
          >
            {saveMutation.isPending ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
