import React from 'react';
import { AppSettings, IntegrationsConfig, LlmConfig } from '../../../types';

const inputCls =
  'w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500';
const labelCls =
  'block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2';

interface Props {
  formData: AppSettings;
  onIntegrationsChange: (key: keyof IntegrationsConfig, value: string) => void;
  onLlmChange: (key: keyof LlmConfig, value: string) => void;
}

export default function SystemTab({
  formData,
  onIntegrationsChange,
  onLlmChange,
}: Props) {
  const llm = formData.llm || {};
  const integrations = formData.integrations || {};

  return (
    <div className="space-y-6">
      {/* LLM Config */}
      <div>
        <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
          AI / LLM Settings (Stored in Database)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>LLM Provider</label>
            <select
              value={llm.provider || 'mock'}
              onChange={(e) => onLlmChange('provider', e.target.value)}
              className={inputCls}
            >
              <option value="mock">Mock (Development)</option>
              <option value="openai">OpenAI</option>
              <option value="groq">Groq Cloud</option>
              <option value="ollama">Ollama (Local)</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>OpenAI Model</label>
            <input
              type="text"
              value={llm.openai_model || 'gpt-4o'}
              onChange={(e) => onLlmChange('openai_model', e.target.value)}
              className={inputCls}
              placeholder="gpt-4o"
            />
          </div>
          <div>
            <label className={labelCls}>Groq Model</label>
            <input
              type="text"
              value={llm.groq_model || 'llama-3.3-70b-versatile'}
              onChange={(e) => onLlmChange('groq_model', e.target.value)}
              className={inputCls}
              placeholder="llama-3.3-70b-versatile"
            />
          </div>
          <div>
            <label className={labelCls}>Ollama Base URL</label>
            <input
              type="text"
              value={llm.ollama_base_url || 'http://localhost:11434'}
              onChange={(e) => onLlmChange('ollama_base_url', e.target.value)}
              className={inputCls}
              placeholder="http://localhost:11434"
            />
          </div>
        </div>
      </div>

      <hr className="border-gray-200 dark:border-gray-800" />

      {/* Platform Integrations */}
      <div>
        <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
          Platform Ingestion Usernames
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className={labelCls}>GitHub Username</label>
            <input
              type="text"
              value={integrations.github_username || ''}
              onChange={(e) => onIntegrationsChange('github_username', e.target.value)}
              className={inputCls}
              placeholder="e.g. AtaCanYmc"
            />
          </div>
          <div>
            <label className={labelCls}>Medium Username</label>
            <input
              type="text"
              value={integrations.medium_username || ''}
              onChange={(e) => onIntegrationsChange('medium_username', e.target.value)}
              className={inputCls}
              placeholder="e.g. atacanymc"
            />
          </div>
          <div>
            <label className={labelCls}>Dev.to Username</label>
            <input
              type="text"
              value={integrations.devto_username || ''}
              onChange={(e) => onIntegrationsChange('devto_username', e.target.value)}
              className={inputCls}
              placeholder="e.g. atacanymc"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
