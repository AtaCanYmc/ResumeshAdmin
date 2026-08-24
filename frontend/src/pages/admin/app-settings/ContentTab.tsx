import React from 'react';
import { HeroContent, MetricItem, LanguageContent } from '../../../types';

const inputCls = 'w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500';
const labelCls = 'block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2';

interface Props {
  lang: 'en' | 'tr';
  content: LanguageContent;
  onHeroChange: (lang: 'en' | 'tr', field: keyof HeroContent, value: string) => void;
  onMetricChange: (lang: 'en' | 'tr', index: number, field: keyof MetricItem, value: string | number) => void;
  onAvatarUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function ContentTab({ lang, content, onHeroChange, onMetricChange, onAvatarUpload }: Props) {
  return (
    <div className="space-y-6">
      {/* Hero Information */}
      <div>
        <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
          Hero Information ({lang.toUpperCase()})
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Display Name</label>
            <input
              type="text"
              value={content.hero.name}
              onChange={(e) => onHeroChange(lang, 'name', e.target.value)}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Full Name</label>
            <input
              type="text"
              value={content.hero.fullName}
              onChange={(e) => onHeroChange(lang, 'fullName', e.target.value)}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Avatar Subtitle</label>
            <input
              type="text"
              value={content.hero.avatarSubtitle}
              onChange={(e) => onHeroChange(lang, 'avatarSubtitle', e.target.value)}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Avatar Image Path / Supabase Upload</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={content.hero.avatarImage}
                onChange={(e) => onHeroChange(lang, 'avatarImage', e.target.value)}
                className={inputCls}
              />
              <label className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl cursor-pointer transition-colors shrink-0 flex items-center gap-1.5 shadow-sm">
                <span>Upload</span>
                <input type="file" accept="image/*" className="hidden" onChange={onAvatarUpload} />
              </label>
            </div>
          </div>
          <div>
            <label className={labelCls}>Resume Download Link</label>
            <input
              type="text"
              value={content.hero.resumeLink}
              onChange={(e) => onHeroChange(lang, 'resumeLink', e.target.value)}
              className={inputCls}
            />
          </div>
        </div>

        <div className="mt-4">
          <label className={labelCls}>Title / Catchphrase</label>
          <input
            type="text"
            value={content.hero.title}
            onChange={(e) => onHeroChange(lang, 'title', e.target.value)}
            className={inputCls}
          />
        </div>

        <div className="mt-4">
          <label className={labelCls}>Description Biography</label>
          <textarea
            value={content.hero.description}
            onChange={(e) => onHeroChange(lang, 'description', e.target.value)}
            rows={4}
            className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <hr className="border-gray-200 dark:border-gray-800" />

      {/* Metrics Cards */}
      <div>
        <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4">Metrics Cards</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {content.metrics.map((metric, index) => (
            <div key={metric.id} className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-500 uppercase tracking-wider">Metric #{metric.id}</span>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Value (e.g. 25+)</label>
                <input
                  type="text"
                  value={metric.value}
                  onChange={(e) => onMetricChange(lang, index, 'value', e.target.value)}
                  className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Label Description</label>
                <input
                  type="text"
                  value={metric.label}
                  onChange={(e) => onMetricChange(lang, index, 'label', e.target.value)}
                  className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
