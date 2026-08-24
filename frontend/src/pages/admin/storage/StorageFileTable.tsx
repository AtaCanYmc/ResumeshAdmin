import { useState } from 'react';
import { Search, FileText, Image as ImageIcon, ExternalLink, Trash2 } from 'lucide-react';

interface StorageFile {
  name: string;
  bucket: string;
  created_at: string | null;
  updated_at: string | null;
  size: number | null;
  content_type: string;
  public_url: string;
}

interface Props {
  files: StorageFile[];
  activeBucket: string;
  isLoading: boolean;
  apiUrl: string;
  onDeleteRequest: (filename: string) => void;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export default function StorageFileTable({ files, activeBucket, isLoading, apiUrl, onDeleteRequest }: Props) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFiles = files.filter((f) =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden space-y-4 p-5">
      {/* Header row: title + search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
          Files in Bucket ({filteredFiles.length})
        </h3>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search file name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl pl-9 pr-4 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Files table */}
      {isLoading ? (
        <div className="p-8 text-center text-gray-500 dark:text-gray-400 text-sm">
          Loading storage files...
        </div>
      ) : filteredFiles.length === 0 ? (
        <div className="p-8 text-center text-gray-500 dark:text-gray-400 text-sm border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl">
          No files found in <span className="font-semibold">{activeBucket}</span>.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800 text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50">
                <th className="py-3 px-4">File Name</th>
                <th className="py-3 px-4">Content Type</th>
                <th className="py-3 px-4">Size</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800 text-sm">
              {filteredFiles.map((file) => (
                <tr key={file.name} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                  <td className="py-3 px-4 font-medium text-gray-900 dark:text-white flex items-center gap-2">
                    {activeBucket === 'cv-pdfs' ? (
                      <FileText size={16} className="text-red-500 shrink-0" />
                    ) : (
                      <ImageIcon size={16} className="text-blue-500 shrink-0" />
                    )}
                    <span className="truncate max-w-xs">{file.name}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                      {file.content_type}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-400 text-xs font-mono">
                    {file.size ? formatBytes(file.size) : 'N/A'}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <a
                        href={`${apiUrl}${file.public_url}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        title="Open Public Link"
                      >
                        <ExternalLink size={16} />
                      </a>
                      <button
                        type="button"
                        onClick={() => onDeleteRequest(file.name)}
                        className="p-1.5 text-gray-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                        title="Delete File"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
