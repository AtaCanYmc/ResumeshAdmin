import React, { useState } from 'react';
import { useLogs } from '../../hooks/useLogs';
import LogTable from '../../components/LogTable';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import { TableSkeleton } from '../../components/ui/Skeletons';
import { ShieldAlert, Search, Filter } from 'lucide-react';

export default function AdminSystemLogs() {
  const [searchQuery, setSearchQuery] = useState('');
  const [level, setLevel] = useState('');
  const { logs, total, loading, error, refetch } = useLogs({
    searchQuery: searchQuery || undefined,
    level: level || undefined,
    refetchInterval: 5000,
  });

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="System Logs"
        description="View real-time system health and audit logs."
        actionLabel="Refresh Logs"
        onAction={() => refetch()}
      />

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search in log messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
        <div className="relative w-full md:w-48">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
          >
            <option value="">All Levels</option>
            <option value="INFO">INFO</option>
            <option value="WARNING">WARNING</option>
            <option value="ERROR">ERROR</option>
            <option value="CRITICAL">CRITICAL</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 p-4 rounded-xl flex items-center gap-3">
          <ShieldAlert className="w-6 h-6 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {loading && !logs.length ? (
        <TableSkeleton />
      ) : (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden">
          <LogTable logs={logs} />
        </div>
      )}
    </div>
  );
}
