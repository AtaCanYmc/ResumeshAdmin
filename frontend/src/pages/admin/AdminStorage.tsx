import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import {
  HardDrive,
  FileText,
  Image as ImageIcon,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { useEnv } from '../../hooks/useEnv';
import StorageStatsBar from './storage/StorageStatsBar';
import StorageUploadForm from './storage/StorageUploadForm';
import StorageFileTable from './storage/StorageFileTable';

interface StorageFile {
  name: string;
  bucket: string;
  created_at: string | null;
  updated_at: string | null;
  size: number | null;
  content_type: string;
  public_url: string;
}

interface BucketInfo {
  name: string;
  description: string;
  allowed_mime: string[];
}

export default function AdminStorage() {
  const { token } = useAuth();
  const { ADMIN_API_URL } = useEnv();
  const queryClient = useQueryClient();

  const [activeBucket, setActiveBucket] = useState<string>('cv-pdfs');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [deletingFile, setDeletingFile] = useState<string | null>(null);

  // ─── Queries ─────────────────────────────────────────────────────────────────

  const { data: buckets = [] } = useQuery<BucketInfo[]>({
    queryKey: ['storage-buckets'],
    queryFn: async () => {
      const res = await axios.get(`${ADMIN_API_URL}/api/v1/admin/storage/buckets`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return res.data;
    }
  });

  const {
    data: files = [],
    isLoading,
    isRefetching,
    refetch
  } = useQuery<StorageFile[]>({
    queryKey: ['storage-files', activeBucket],
    queryFn: async () => {
      const res = await axios.get(`${ADMIN_API_URL}/api/v1/admin/storage/files?bucket=${activeBucket}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return res.data;
    }
  });

  // ─── Delete Mutation ──────────────────────────────────────────────────────────

  const deleteMutation = useMutation({
    mutationFn: async (filename: string) => {
      await axios.delete(
        `${ADMIN_API_URL}/api/v1/admin/storage/files?bucket=${activeBucket}&filename=${encodeURIComponent(filename)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
    },
    onSuccess: () => {
      toast.success('File deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['storage-files', activeBucket] });
      setDeletingFile(null);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.detail || 'Failed to delete file');
      setDeletingFile(null);
    }
  });

  // ─── Upload Handler ───────────────────────────────────────────────────────────

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;
    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);
    try {
      await axios.post(
        `${ADMIN_API_URL}/api/v1/admin/storage/upload?bucket=${activeBucket}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      toast.success(`File uploaded to ${activeBucket} bucket!`);
      setSelectedFile(null);
      queryClient.invalidateQueries({ queryKey: ['storage-files', activeBucket] });
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to upload file');
    } finally {
      setIsUploading(false);
    }
  };

  // ─── Derived state ────────────────────────────────────────────────────────────

  const totalSize = files.reduce((acc, f) => acc + (f.size || 0), 0);

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <HardDrive className="text-blue-600 dark:text-blue-400" />
            Supabase Storage Management
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Upload, inspect, download, and monitor files stored across Supabase Storage buckets.
          </p>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isRefetching}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl text-sm font-medium transition-colors self-start sm:self-auto"
        >
          <RefreshCw size={16} className={isRefetching ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Stats Bar */}
      <StorageStatsBar
        activeBucket={activeBucket}
        totalFiles={files.length}
        totalSize={totalSize}
      />

      {/* Bucket Selector Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-800 flex gap-2">
        {buckets.map((b) => (
          <button
            key={b.name}
            onClick={() => {
              setActiveBucket(b.name);
            }}
            className={`pb-3 px-4 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors ${
              activeBucket === b.name
                ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
            }`}
          >
            {b.name === 'cv-pdfs' ? <FileText size={16} /> : <ImageIcon size={16} />}
            {b.name}
          </button>
        ))}
      </div>

      {/* Upload Form */}
      <StorageUploadForm
        activeBucket={activeBucket}
        selectedFile={selectedFile}
        isUploading={isUploading}
        onFileSelect={setSelectedFile}
        onSubmit={handleUpload}
      />

      {/* File Table */}
      <StorageFileTable
        files={files}
        activeBucket={activeBucket}
        isLoading={isLoading}
        apiUrl={ADMIN_API_URL}
        onDeleteRequest={setDeletingFile}
      />

      {/* Delete Confirmation Modal */}
      {deletingFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
              <AlertCircle size={24} />
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Delete File</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Are you sure you want to delete{' '}
              <span className="font-semibold text-gray-900 dark:text-white">{deletingFile}</span> from{' '}
              <span className="font-semibold">{activeBucket}</span> bucket? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingFile(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => deleteMutation.mutate(deletingFile)}
                disabled={deleteMutation.isPending}
                className="px-4 py-2 text-sm font-semibold bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors flex items-center gap-2"
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Delete File'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
