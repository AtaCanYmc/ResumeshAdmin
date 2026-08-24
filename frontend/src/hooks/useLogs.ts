import { useQuery } from '@tanstack/react-query';
import { fetchSystemLogs } from '../services/adminService';
import { useAuth } from '../context/AuthContext';

interface UseLogsOptions {
  page?: number;
  level?: string;
  module?: string;
  searchQuery?: string;
  startDate?: string;
  endDate?: string;
  refetchInterval?: number;
}

export const useLogs = (options: UseLogsOptions = {}) => {
  const { token } = useAuth();

  const query = useQuery({
    queryKey: ['system-logs', options.page, options.level, options.module, options.searchQuery, options.startDate, options.endDate],
    queryFn: () => fetchSystemLogs(
      token!,
      options.page || 1,
      options.level,
      options.module,
      options.searchQuery,
      options.startDate,
      options.endDate
    ),
    enabled: !!token,
    refetchInterval: options.refetchInterval || 0, // Enable polling if > 0
  });

  return {
    logs: query.data?.data || [],
    total: query.data?.total || 0,
    loading: query.isLoading || query.isFetching,
    error: query.error ? (query.error as any).response?.data?.detail || 'Loglar çekilirken bir hata oluştu.' : null,
    refetch: query.refetch,
  };
};
