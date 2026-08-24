import { Database, FileCheck, HardDrive } from 'lucide-react';

interface Props {
  activeBucket: string;
  totalFiles: number;
  totalSize: number;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export default function StorageStatsBar({ activeBucket, totalFiles, totalSize }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="p-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl">
            <Database size={20} />
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider">Active Bucket</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white mt-0.5">{activeBucket}</p>
          </div>
        </div>
      </div>

      <div className="p-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-xl">
            <FileCheck size={20} />
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider">Total Files</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white mt-0.5">{totalFiles}</p>
          </div>
        </div>
      </div>

      <div className="p-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-xl">
            <HardDrive size={20} />
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider">Total Size</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white mt-0.5">{formatBytes(totalSize)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
