import React, { useState } from 'react';
import axios from 'axios';
import {
  Check,
  Code2,
  Copy,
  Download,
  FileCode,
  FileText,
  Globe,
  Loader2,
  Send,
  Sparkles,
  Wand2,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import AdminPageHeader from '../../components/admin/AdminPageHeader';
import { useAuth } from '../../context/AuthContext';
import { useEnv } from '../../hooks/useEnv';
import { useContentConfig } from '../../hooks/useHomeData';

export default function AdminAiCv() {
  const { token } = useAuth();
  const { ADMIN_API_URL } = useEnv();
  const { i18n } = useTranslation();
  const { data: config } = useContentConfig(i18n.language);

  const [jobUrl, setJobUrl] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  // Default Reactive Resume JSON format template
  const defaultReactiveResumeData = {
    title: 'Tailored AI Resume',
    basics: {
      name: config?.hero?.fullName || config?.hero?.name || 'Ata Can Yılmaz',
      headline: 'Senior Full Stack Software Engineer',
      email: 'atacanymc@resumesh.dev',
      url: { label: 'Portfolio', href: 'https://resumesh.dev' },
      summary:
        'Experienced Full Stack Engineer specializing in React, TypeScript, Python, and scalable cloud architectures.',
    },
    sections: {
      work: {
        name: 'Work Experience',
        items: [
          {
            name: 'ResuMesh',
            position: 'Lead Software Architect',
            date: '2022 - Present',
            summary:
              'Architected full-stack open source developer portfolio platform with automated AI ingestion and Supabase integration.',
          },
        ],
      },
      projects: {
        name: 'Projects',
        items: [
          {
            name: 'ResumeshAdmin',
            description:
              'Full-featured admin workspace & telemetry suite for developer portfolios.',
            keywords: ['React', 'FastAPI', 'TailwindCSS', 'SQLite', 'PostgreSQL'],
            url: 'https://github.com/AtaCanYmc/ResumeshAdmin',
          },
        ],
      },
      skills: {
        name: 'Skills',
        items: [
          {
            name: 'Languages & Frameworks',
            keywords: ['TypeScript', 'Python', 'React', 'FastAPI', 'Docker'],
          },
        ],
      },
    },
  };

  const [reactiveResumeJson, setReactiveResumeJson] = useState<string>(
    JSON.stringify(defaultReactiveResumeData, null, 2)
  );

  const parsedData = React.useMemo(() => {
    try {
      return JSON.parse(reactiveResumeJson);
    } catch {
      return defaultReactiveResumeData;
    }
  }, [reactiveResumeJson]);

  const handleGenerateCV = async () => {
    if (!jobUrl) return;
    setIsGenerating(true);
    try {
      const res = await axios.post(
        `${ADMIN_API_URL}/api/v1/admin/generate-cv`,
        { job_url: jobUrl },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const cvData = res.data?.cv_data || res.data;
      if (cvData) {
        // Construct Reactive Resume structure if not formatted
        const reactiveResumePayload = {
          title: cvData.title || 'Tailored AI Resume',
          basics: {
            name:
              cvData.basics?.name ||
              config?.hero?.fullName ||
              config?.hero?.name ||
              'Ata Can Yılmaz',
            headline: cvData.basics?.headline || 'Senior Software Engineer',
            email: cvData.basics?.email || 'atacanymc@resumesh.dev',
            url: cvData.basics?.url || {
              label: 'Portfolio',
              href: 'https://resumesh.dev',
            },
            summary:
              cvData.summary ||
              cvData.basics?.summary ||
              `Tailored resume optimized for job posting: ${jobUrl}`,
          },
          sections: cvData.sections || {
            work: {
              name: 'Work Experience',
              items: cvData.selected_experiences ||
                cvData.experiences || [
                  {
                    name: 'Targeted Role Experience',
                    position: 'Software Engineer',
                    date: 'Present',
                    summary: `Optimized for requirements at ${jobUrl}`,
                  },
                ],
            },
            projects: {
              name: 'Projects',
              items: cvData.selected_projects || cvData.projects || [],
            },
            skills: {
              name: 'Skills',
              items: cvData.skills || [],
            },
          },
        };

        setReactiveResumeJson(
          JSON.stringify(reactiveResumePayload, null, 2)
        );
        toast.success('Tailored Reactive Resume JSON generated successfully!');
      }
    } catch (err: any) {
      toast.error(
        err.response?.data?.detail || 'Failed to generate tailored CV.'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(reactiveResumeJson);
    setCopied(true);
    toast.success('Reactive Resume JSON copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadJson = () => {
    const blob = new Blob([reactiveResumeJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'reactive_resume_schema.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    toast.success('Downloaded reactive_resume_schema.json');
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="AI CV Builder"
        description="Generate a tailored resume output in Reactive Resume format using AI analysis."
      />

      {/* Input Row */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-xs dark:border-gray-800 dark:bg-gray-900">
        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Job Posting URL
        </label>
        <div className="flex flex-col gap-4 sm:flex-row">
          <input
            type="url"
            value={jobUrl}
            onChange={(e) => setJobUrl(e.target.value)}
            placeholder="https://linkedin.com/jobs/view/..."
            className="flex-1 rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-950 dark:text-white"
          />
          <button
            onClick={handleGenerateCV}
            disabled={isGenerating || !jobUrl}
            className="flex cursor-pointer items-center justify-center gap-2 shrink-0 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 font-medium text-white shadow-md transition-all hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50"
          >
            {isGenerating ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Wand2 className="h-5 w-5" />
            )}
            Analyze & Generate Reactive Resume
          </button>
        </div>
      </div>

      {/* Two Column Grid */}
      <div className="grid h-[620px] grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left Column: Reactive Resume JSON Schema Editor */}
        <div className="flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xs dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-800 dark:bg-gray-950">
            <span className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300">
              <FileCode className="h-4 w-4 text-blue-500" />
              Reactive Resume JSON Schema
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyJson}
                className="flex items-center gap-1.5 rounded-md bg-gray-200 px-2.5 py-1 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-300 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                title="Copy JSON"
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
                {copied ? 'Copied' : 'Copy'}
              </button>
              <button
                onClick={handleDownloadJson}
                className="flex items-center gap-1.5 rounded-md bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-600 transition-colors hover:bg-blue-100 dark:bg-blue-950/60 dark:text-blue-400 dark:hover:bg-blue-900/50"
                title="Download JSON Schema"
              >
                <Download className="h-3.5 w-3.5" />
                JSON
              </button>
            </div>
          </div>
          <textarea
            value={reactiveResumeJson}
            onChange={(e) => setReactiveResumeJson(e.target.value)}
            className="flex-1 resize-none bg-transparent p-4 font-mono text-xs leading-relaxed text-gray-800 focus:outline-none dark:text-gray-300"
            placeholder="Reactive Resume JSON schema will be rendered here..."
          />
        </div>

        {/* Right Column: Reactive Resume Structure Card Preview */}
        <div className="flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xs dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-800 dark:bg-gray-950">
            <span className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300">
              <Sparkles className="h-4 w-4 text-indigo-500" />
              Reactive Resume Format Preview
            </span>
            <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 font-mono text-[10px] font-bold text-indigo-600 uppercase dark:bg-indigo-950/60 dark:text-indigo-400">
              JSON Schema v4
            </span>
          </div>

          <div className="flex-1 overflow-y-auto bg-gray-50/50 p-6 space-y-6 dark:bg-gray-950/50">
            {/* Basics Header Card */}
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-2xs dark:border-gray-800 dark:bg-gray-900">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    {parsedData.basics?.name || 'Candidate Name'}
                  </h2>
                  <p className="font-mono text-xs font-semibold text-blue-600 dark:text-blue-400">
                    {parsedData.basics?.headline || 'Headline'}
                  </p>
                </div>
                {parsedData.basics?.email && (
                  <span className="font-mono text-xs text-gray-500 dark:text-gray-400">
                    {parsedData.basics.email}
                  </span>
                )}
              </div>

              {parsedData.basics?.summary && (
                <p className="mt-3 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
                  {parsedData.basics.summary}
                </p>
              )}
            </div>

            {/* Work Section */}
            {parsedData.sections?.work?.items?.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-mono text-xs font-bold text-gray-700 uppercase tracking-wider dark:text-gray-300">
                  Work Experience
                </h3>
                <div className="space-y-3">
                  {parsedData.sections.work.items.map((item: any, idx: number) => (
                    <div
                      key={idx}
                      className="rounded-lg border border-gray-200 bg-white p-4 shadow-2xs dark:border-gray-800 dark:bg-gray-900"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-gray-900 text-sm dark:text-gray-100">
                          {item.position || item.title || 'Position'}
                        </h4>
                        <span className="font-mono text-[11px] text-gray-500 dark:text-gray-400">
                          {item.date || item.duration || 'Date'}
                        </span>
                      </div>
                      <p className="font-semibold text-xs text-blue-600 dark:text-blue-400 mt-0.5">
                        {item.company || item.name || 'Company'}
                      </p>
                      {item.summary && (
                        <p className="mt-2 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
                          {item.summary}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Projects Section */}
            {parsedData.sections?.projects?.items?.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-mono text-xs font-bold text-gray-700 uppercase tracking-wider dark:text-gray-300">
                  Selected Projects
                </h3>
                <div className="space-y-3">
                  {parsedData.sections.projects.items.map(
                    (proj: any, idx: number) => (
                      <div
                        key={idx}
                        className="rounded-lg border border-gray-200 bg-white p-4 shadow-2xs dark:border-gray-800 dark:bg-gray-900"
                      >
                        <h4 className="font-bold text-gray-900 text-sm dark:text-gray-100">
                          {proj.name || proj.title}
                        </h4>
                        <p className="mt-1 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
                          {proj.description}
                        </p>
                        {proj.keywords && proj.keywords.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-1.5">
                            {proj.keywords.map((kw: string, kIdx: number) => (
                              <span
                                key={kIdx}
                                className="rounded border border-gray-200 bg-gray-100 px-2 py-0.5 font-mono text-[10px] text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                              >
                                {kw}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  )}
                </div>
              </div>
            )}

            {/* Skills Section */}
            {parsedData.sections?.skills?.items?.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-mono text-xs font-bold text-gray-700 uppercase tracking-wider dark:text-gray-300">
                  Skills & Expertise
                </h3>
                <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-2xs dark:border-gray-800 dark:bg-gray-900">
                  <div className="flex flex-wrap gap-2">
                    {parsedData.sections.skills.items.map(
                      (sk: any, idx: number) => (
                        <span
                          key={idx}
                          className="rounded-md border border-blue-200 bg-blue-50 px-2.5 py-1 font-mono text-xs font-medium text-blue-700 dark:border-blue-800/60 dark:bg-blue-950/60 dark:text-blue-300"
                        >
                          {sk.name || sk}
                        </span>
                      )
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
