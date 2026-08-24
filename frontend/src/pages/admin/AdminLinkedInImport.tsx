import React, { useState } from 'react';
import { Upload, ShieldAlert, Loader2, FileText } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useEnv } from '../../hooks/useEnv';
import AdminPageHeader from '../../components/admin/AdminPageHeader';

export default function AdminLinkedInImport() {
  const { token } = useAuth();
  const { ADMIN_API_URL } = useEnv();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  const handleFileUpload = async () => {
    if (!selectedFile) return;
    setIsUploading(true);
    setUploadMessage(null);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await axios.post(`${ADMIN_API_URL}/api/v1/admin/import/linkedin-pdf`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });
      setUploadMessage({ type: 'success', text: response.data.message || 'PDF successfully parsed and saved.' });
      setSelectedFile(null);
    } catch (err: any) {
      setUploadMessage({ type: 'error', text: err.response?.data?.detail || err.message || 'Upload failed.' });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="LinkedIn Import"
        description="Import your LinkedIn profile PDF."
      />

      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-8 shadow-sm max-w-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 mb-4">
            <Upload className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Import LinkedIn PDF</h2>
          <p className="text-gray-500 dark:text-gray-400">
            Upload your LinkedIn profile PDF. AI will analyze it and update your portfolio data.
          </p>
        </div>

        {uploadMessage && (
          <div className={`p-4 rounded-xl mb-6 flex items-center gap-3 ${uploadMessage.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800' : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800'}`}>
            {uploadMessage.type === 'error' && <ShieldAlert className="w-5 h-5 shrink-0" />}
            <p>{uploadMessage.text}</p>
          </div>
        )}

        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-center w-full">
            <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-gray-300 dark:border-gray-700 border-dashed rounded-xl cursor-pointer bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <FileText className="w-8 h-8 mb-3 text-gray-400" />
                <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                  <span className="font-semibold text-gray-700 dark:text-gray-300">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-400">PDF files only (.pdf)</p>
              </div>
              <input
                type="file"
                className="hidden"
                accept=".pdf"
                onChange={(e) => setSelectedFile(e.target.files ? e.target.files[0] : null)}
              />
            </label>
          </div>

          {selectedFile && (
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate pr-4">{selectedFile.name}</span>
              <button
                onClick={() => setSelectedFile(null)}
                className="text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 font-medium text-sm transition-colors"
              >
                Cancel
              </button>
            </div>
          )}

          <button
            onClick={handleFileUpload}
            disabled={isUploading || !selectedFile}
            className="mt-4 flex justify-center items-center gap-2 w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-medium transition-colors text-white shadow-sm"
          >
            {isUploading ? <Loader2 className="animate-spin w-5 h-5" /> : <Upload className="w-5 h-5" />}
            {isUploading ? 'AI is analyzing...' : 'Import Data'}
          </button>
        </div>
      </div>
    </div>
  );
}
