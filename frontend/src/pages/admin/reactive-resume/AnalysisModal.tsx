import { Sparkles, FileBarChart2, X } from 'lucide-react';
import { AnalysisResult } from './types';

interface Props {
  resumeName: string;
  analysis: AnalysisResult;
  onClose: () => void;
}

export default function AnalysisModal({ resumeName, analysis, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl transition-all">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Sparkles className="text-indigo-500" size={20} />
            AI Quality Analysis: {resumeName}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1.5 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 max-h-[60vh] overflow-y-auto space-y-6">
          {/* Score Indicator */}
          <div className="flex items-center gap-6 p-4 bg-indigo-50/50 dark:bg-indigo-950/10 rounded-2xl border border-indigo-100/40 dark:border-indigo-900/20">
            <div className="relative w-20 h-20 flex items-center justify-center bg-indigo-600 text-white rounded-full font-bold text-2xl shadow-inner">
              {analysis.score}
              <span className="text-[10px] absolute bottom-2 font-normal uppercase opacity-70">Score</span>
            </div>
            <div>
              <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                Rating: <span className="text-indigo-600 dark:text-indigo-400">{analysis.rating}</span>
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{analysis.feedback}</p>
            </div>
          </div>

          {/* Suggestions */}
          {analysis.suggestions && analysis.suggestions.length > 0 && (
            <div className="space-y-2">
              <h5 className="font-bold text-sm text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <FileBarChart2 size={16} className="text-indigo-500" />
                Key Suggestions &amp; Improvements
              </h5>
              <ul className="list-disc pl-5 text-sm text-gray-600 dark:text-gray-300 space-y-1.5">
                {analysis.suggestions.map((suggestion, idx) => (
                  <li key={idx}>{suggestion}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Tips */}
          {analysis.tips && analysis.tips.length > 0 && (
            <div className="space-y-2">
              <h5 className="font-bold text-sm text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles size={16} className="text-green-500" />
                Career &amp; Industry Tips
              </h5>
              <ul className="list-disc pl-5 text-sm text-gray-600 dark:text-gray-300 space-y-1.5">
                {analysis.tips.map((tip, idx) => (
                  <li key={idx}>{tip}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-100 dark:border-gray-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
