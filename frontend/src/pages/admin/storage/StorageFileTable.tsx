import { useState } from 'react';
import { ExternalLink, FileText, Image as ImageIcon, Search, Trash2 } from 'lucide-react';

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

export default function StorageFileTable({
  files,
  activeBucket,
  isLoading,
  apiUrl,
  onDeleteRequest,
}: Props) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFiles = files.filter((f) =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4 overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 shadow-xs dark:border-gray-800 dark:bg-gray-900">
      {/* Header row: title + search */}
      <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
        <h3 className="text-sm font-bold tracking-wider text-gray-900 uppercase dark:text-white">
          Files in Bucket ({filteredFiles.length})
        </h3>
        <div className="relative w-full sm:w-64">
          <Search className="absolute top-2.5 left-3 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search file name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2 pr-4 pl-9 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          />
        </div>
      </div>

      {/* Files table */}
      {isLoading ? (
        <div className="p-8 text-center text-sm text-gray-500 dark:text-gray-400">
          Loading storage files...
        </div>
      ) : filteredFiles.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-gray-200 p-8 text-center text-sm text-gray-500 dark:border-gray-800 dark:text-gray-400">
          No files found in <span className="font-semibold">{activeBucket}</span>.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-xs font-semibold text-gray-500 uppercase dark:border-gray-800 dark:bg-gray-800/50 dark:text-gray-400">
                <th className="py-3 px-4">File Name</th>
                <th className="py-3 px-4">Content Type</th>
                <th className="py-3 px-4">Size</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-sm dark:divide-gray-800">
              {filteredFiles.map((file) => {
                const fullUrl = file.public_url.startsWith('http')
                  ? file.public_url
                  : `${apiUrl}${file.public_url}`;

                return (
                  <tr
                    key={file.name}
                    className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/30"
                  >
                    <td className="flex items-center gap-2 py-3 px-4 font-medium text-gray-900 dark:text-white">
                      {activeBucket.includes('cv') ? (
                        <FileText size={16} className="shrink-0 text-red-500" />
                      ) : (
                        <ImageIcon size={16} className="shrink-0 text-blue-500" />
                      )}
                      <span className="max-w-xs truncate">{file.name}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                        {file.content_type}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-xs text-gray-600 dark:text-gray-400">
                      {file.size ? formatBytes(file.size) : 'N/A'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <a
                          href={fullUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 text-gray-500 transition-colors hover:text-blue-600 dark:hover:text-blue-400"
                          title="Open Public Link"
                        >
                          <ExternalLink size={16} />
                        </a>
                        <button
                          type="button"
                          onClick={() => onDeleteRequest(file.name)}
                          className="p-1.5 text-gray-500 transition-colors hover:text-red-600 dark:hover:text-red-400"
                          title="Delete File"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
