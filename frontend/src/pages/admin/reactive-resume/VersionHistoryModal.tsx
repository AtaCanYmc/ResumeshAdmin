import { History, Calendar, X } from 'lucide-react';
import { ResumeVersion } from './types';

interface Props {
  resumeName: string;
  versions: ResumeVersion[];
  isLoading: boolean;
  onClose: () => void;
}

export default function VersionHistoryModal({ resumeName, versions, isLoading, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl transition-all">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <History className="text-blue-500" size={20} />
            Version History: {resumeName}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1.5 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4">
          {isLoading ? (
            <div className="space-y-3 py-4">
              <div className="h-10 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-lg" />
              <div className="h-10 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-lg" />
            </div>
          ) : versions.length === 0 ? (
            <p className="text-center py-6 text-sm text-gray-500 dark:text-gray-400">
              No backup versions or revisions found for this resume.
            </p>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {versions.map((ver, idx) => (
                <div key={ver.id || idx} className="py-3.5 flex items-center justify-between first:pt-0 last:pb-0">
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white text-sm">
                      {ver.name || `Revision #${versions.length - idx}`}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      ID: <code className="bg-gray-50 dark:bg-gray-800/80 px-1 py-0.5 rounded text-[10px]">{ver.id || ver.id_}</code>
                    </p>
                  </div>
                  <span className="text-xs font-medium text-gray-500 flex items-center gap-1">
                    <Calendar size={13} />
                    {new Date(ver.createdAt).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-100 dark:border-gray-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-700 dark:text-gray-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
