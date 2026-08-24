import React from 'react';
import { Plus } from 'lucide-react';

interface AdminPageHeaderProps {
  title: string;
  description?: string;
  actionLabel?: string;
  actionIcon?: React.ReactNode;
  onAction?: () => void;
  secondaryActionLabel?: string;
  secondaryActionIcon?: React.ReactNode;
  onSecondaryAction?: () => void;
  isSecondaryPending?: boolean;
}

export default function AdminPageHeader({
  title,
  description,
  actionLabel,
  actionIcon = <Plus size={18} />,
  onAction,
  secondaryActionLabel,
  secondaryActionIcon,
  onSecondaryAction,
  isSecondaryPending = false,
}: AdminPageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h1>
        {description && <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{description}</p>}
      </div>
      <div className="flex items-center gap-3">
        {secondaryActionLabel && onSecondaryAction && (
          <button
            onClick={onSecondaryAction}
            disabled={isSecondaryPending}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 font-medium rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 shadow-sm disabled:opacity-50"
          >
            {secondaryActionIcon}
            {secondaryActionLabel}
          </button>
        )}
        {actionLabel && onAction && (
          <button
            onClick={onAction}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 shadow-sm"
          >
            {actionIcon}
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  );
}
