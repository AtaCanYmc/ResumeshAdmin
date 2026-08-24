import React from 'react';
import { Pencil, Trash2 } from 'lucide-react';

interface Column<T> {
  header: string;
  accessorKey: keyof T | string;
  cell?: (item: T) => React.ReactNode;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  keyExtractor: (item: T) => string | number;
}

export default function DataTable<T>({ data, columns, onEdit, onDelete, keyExtractor }: DataTableProps<T>) {
  return (
    <div className="w-full overflow-x-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm">
      <table className="w-full text-sm text-left">
        <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-gray-950/50 dark:text-gray-400 border-b border-gray-200 dark:border-gray-800">
          <tr>
            {columns.map((col, idx) => (
              <th key={idx} className="px-6 py-4 font-medium">
                {col.header}
              </th>
            ))}
            {(onEdit || onDelete) && <th className="px-6 py-4 text-right font-medium">Actions</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length + (onEdit || onDelete ? 1 : 0)} className="px-6 py-8 text-center text-gray-500">
                No records found.
              </td>
            </tr>
          ) : (
            data.map((item) => (
              <tr key={keyExtractor(item)} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                {columns.map((col, idx) => (
                  <td key={idx} className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-gray-300">
                    {col.cell ? col.cell(item) : String(item[col.accessorKey as keyof T] || '')}
                  </td>
                ))}
                {(onEdit || onDelete) && (
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-2">
                      {onEdit && (
                        <button
                          onClick={() => onEdit(item)}
                          className="p-2 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors focus:outline-none"
                          title="Edit"
                        >
                          <Pencil size={16} />
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={() => onDelete(item)}
                          className="p-2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors focus:outline-none ml-1"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
