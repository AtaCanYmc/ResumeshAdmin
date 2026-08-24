import React from 'react';
import { LayoutDashboard, RefreshCw } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import { useAuth } from '../../context/AuthContext';
import { useEnv } from '../../hooks/useEnv';

export default function AdminOverview() {
  const { token } = useAuth();
  const { ADMIN_API_URL } = useEnv();
  const queryClient = useQueryClient();

  const refreshMutation = useMutation({
    mutationFn: async () => {
      await axios.post(`${ADMIN_API_URL}/api/v1/admin/refresh-data`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
    },
    onSuccess: () => {
      toast.success('Data successfully refreshed from platforms!');
      // Invalidate all related queries to refetch
      queryClient.invalidateQueries({ queryKey: ['admin-projects'] });
      queryClient.invalidateQueries({ queryKey: ['admin-experiences'] });
      queryClient.invalidateQueries({ queryKey: ['admin-articles'] });
      queryClient.invalidateQueries({ queryKey: ['admin-certificates'] });
      queryClient.invalidateQueries({ queryKey: ['admin-system-logs'] });
      queryClient.invalidateQueries({ queryKey: ['home-data'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to refresh data.');
    }
  });

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Dashboard Overview"
        description="Welcome to your ResuMesh Admin Portal."
        actionLabel={refreshMutation.isPending ? "Refreshing..." : "Refresh Data"}
        actionIcon={<RefreshCw size={18} className={refreshMutation.isPending ? "animate-spin" : ""} />}
        onAction={() => refreshMutation.mutate()}
      />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
              <LayoutDashboard size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Quick Start</p>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Select a module</h3>
            </div>
          </div>
          <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            Use the sidebar to navigate to your projects, articles, experiences, or tools.
          </p>
        </div>
      </div>
    </div>
  );
}
