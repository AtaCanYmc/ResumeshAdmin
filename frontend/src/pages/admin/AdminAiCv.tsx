import React, { useState } from 'react';
import { Wand2, Loader2, FileText, Download } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import DOMPurify from 'dompurify';
import { useContentConfig } from '../../hooks/useHomeData';
import AdminPageHeader from '../../components/admin/AdminPageHeader';

export default function AdminAiCv() {
  const { i18n } = useTranslation();
  const { data: config } = useContentConfig(i18n.language);
  const [jobUrl, setJobUrl] = useState('');
  const [cvMarkdown, setCvMarkdown] = useState('# Generated CV\n\nWaiting for analysis...');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateCV = async () => {
    if (!jobUrl) return;
    setIsGenerating(true);
    // Mock API call
    setTimeout(() => {
      const name = config?.hero?.fullName || config?.hero?.name || 'Developer Name';
      setCvMarkdown(`# ${name}\n## Senior Software Engineer\n\n**Tailored for:** ${jobUrl}\n\n- Expert in React, Python, and AI Workflows\n- Proven track record of scalable architecture`);
      setIsGenerating(false);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="AI CV Builder"
        description="Generate a custom tailored CV using AI."
      />

      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Job Posting URL</label>
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="url"
            value={jobUrl}
            onChange={(e) => setJobUrl(e.target.value)}
            placeholder="https://linkedin.com/jobs/view/..."
            className="flex-1 bg-gray-50 dark:bg-gray-950 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow dark:text-white"
          />
          <button
            onClick={handleGenerateCV}
            disabled={isGenerating || !jobUrl}
            className="flex justify-center items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 rounded-lg font-medium transition-all shadow-md shrink-0 text-white"
          >
            {isGenerating ? <Loader2 className="animate-spin w-5 h-5" /> : <Wand2 className="w-5 h-5" />}
            Analyze & Generate CV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[600px]">
        {/* Left Panel: Markdown Editor */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden flex flex-col shadow-sm">
          <div className="px-4 py-3 bg-gray-50 dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <FileText className="w-4 h-4" /> Markdown Editor
            </span>
          </div>
          <textarea
            value={cvMarkdown}
            onChange={(e) => setCvMarkdown(e.target.value)}
            className="flex-1 bg-transparent p-4 focus:outline-none resize-none text-gray-800 dark:text-gray-300 font-mono text-sm leading-relaxed"
            placeholder="Generated markdown will appear here..."
          />
        </div>

        {/* Right Panel: PDF Preview (Mocked) */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden flex flex-col shadow-sm relative">
          <div className="px-4 py-3 bg-gray-50 dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center z-10">
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
              PDF Preview
            </span>
            <button className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-lg transition-colors text-sm font-medium">
              <Download className="w-4 h-4" />
              Download (PDF)
            </button>
          </div>

          {/* Simulated Paper */}
          <div className="flex-1 bg-gray-100 dark:bg-gray-950 p-8 overflow-y-auto flex justify-center">
            <div className="w-full max-w-[210mm] min-h-[297mm] bg-white text-black p-8 shadow-md border border-gray-200">
                <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(cvMarkdown.replace(/\n/g, '<br/>').replace(/## (.*?)<br\/>/g, '<h2 class="text-xl font-bold mt-4 mb-2">$1</h2>').replace(/# (.*?)<br\/>/g, '<h1 class="text-3xl font-extrabold mb-4">$1</h1>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')) }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
