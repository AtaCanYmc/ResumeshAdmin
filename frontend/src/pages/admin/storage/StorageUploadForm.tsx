import React from 'react';
import { Upload, RefreshCw } from 'lucide-react';

interface Props {
  activeBucket: string;
  selectedFile: File | null;
  isUploading: boolean;
  onFileSelect: (file: File | null) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function StorageUploadForm({ activeBucket, selectedFile, isUploading, onFileSelect, onSubmit }: Props) {
  return (
    <form onSubmit={onSubmit} className="p-5 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
      <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
        <Upload size={16} className="text-blue-600 dark:text-blue-400" />
        Upload New File to <span className="text-blue-600 dark:text-blue-400">{activeBucket}</span>
      </h3>
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <input
          type="file"
          onChange={(e) => onFileSelect(e.target.files?.[0] || null)}
          className="w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/30 dark:file:text-blue-400 cursor-pointer"
        />
        <button
          type="submit"
          disabled={!selectedFile || isUploading}
          className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-colors shrink-0 flex items-center justify-center gap-2"
        >
          {isUploading ? (
            <>
              <RefreshCw size={16} className="animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload size={16} />
              Upload File
            </>
          )}
        </button>
      </div>
    </form>
  );
}
