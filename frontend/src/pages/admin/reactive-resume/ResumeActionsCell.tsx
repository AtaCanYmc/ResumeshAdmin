import { RefreshCw, Download, History, Sparkles, FileBarChart2 } from 'lucide-react';
import { Resume } from './types';

interface Props {
  resume: Resume;
  syncingId: string | null;
  downloadingId: string | null;
  analyzingId: string | null;
  isViewAnalysisPending: boolean;
  onSync: (id: string) => void;
  onDownloadPdf: (id: string) => void;
  onViewVersions: (id: string, name: string) => void;
  onAnalyze: (id: string) => void;
  onViewAnalysis: (id: string) => void;
}

export default function ResumeActionsCell({
  resume,
  syncingId,
  downloadingId,
  analyzingId,
  isViewAnalysisPending,
  onSync,
  onDownloadPdf,
  onViewVersions,
  onAnalyze,
  onViewAnalysis,
}: Props) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        onClick={() => onSync(resume.id)}
        disabled={syncingId !== null}
        className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
        title="Sync Local Data to Resume"
      >
        <RefreshCw size={13} className={syncingId === resume.id ? 'animate-spin' : ''} />
        Sync
      </button>

      <button
        onClick={() => onDownloadPdf(resume.id)}
        disabled={downloadingId !== null}
        className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50 text-gray-700 dark:text-gray-200"
        title="Open PDF in new tab"
      >
        <Download size={13} className={downloadingId === resume.id ? 'animate-spin' : ''} />
        PDF
      </button>

      <button
        onClick={() => onViewVersions(resume.id, resume.name)}
        className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors text-gray-700 dark:text-gray-200"
        title="View History Versions"
      >
        <History size={13} />
        Versions
      </button>

      <button
        onClick={() => onAnalyze(resume.id)}
        disabled={analyzingId !== null}
        className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-400 dark:hover:bg-indigo-900/40 rounded-lg transition-colors disabled:opacity-50"
        title="Run AI Resume Quality Analysis"
      >
        <Sparkles size={13} className={analyzingId === resume.id ? 'animate-pulse' : ''} />
        {analyzingId === resume.id ? 'Analyzing...' : 'Analyze'}
      </button>

      <button
        onClick={() => onViewAnalysis(resume.id)}
        disabled={isViewAnalysisPending}
        className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold border border-indigo-250 dark:border-indigo-900/50 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20 text-indigo-700 dark:text-indigo-400 rounded-lg transition-colors disabled:opacity-50"
        title="View Persisted AI Analysis"
      >
        <FileBarChart2 size={13} className={isViewAnalysisPending ? 'animate-spin' : ''} />
        Report
      </button>
    </div>
  );
}
