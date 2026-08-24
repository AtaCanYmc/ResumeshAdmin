import { AppSettings, SectionVisibility } from '../../../types';
import ToggleSwitch from './ToggleSwitch';

const inputCls = 'w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500';
const labelCls = 'block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2';

interface Props {
  formData: AppSettings;
  onVisibilityToggle: (key: keyof SectionVisibility) => void;
  onFooterEmailChange: (email: string) => void;
  onMarqueeChange: (value: string) => void;
}

const SECTION_TOGGLES: Array<{ key: keyof SectionVisibility; label: string; description: string }> = [
  { key: 'educations', label: 'Educations Section', description: 'Show or hide your educations page on the public site.' },
  { key: 'experiences', label: 'Experiences Section', description: 'Show or hide your experiences page on the public site.' },
  { key: 'projects', label: 'Projects Section', description: 'Show or hide your projects page on the public site.' },
  { key: 'certificates', label: 'Certificates Section', description: 'Show or hide your certificates page on the public site.' },
  { key: 'articles', label: 'Articles Section', description: 'Show or hide your articles page on the public site.' },
  { key: 'videos', label: 'Videos Section', description: 'Show or hide your videos page on the public site.' },
  { key: 'skills', label: 'Skills Section', description: 'Show or hide your skills page on the public site.' },
  { key: 'posts', label: 'Posts Section', description: 'Show or hide your posts page on the public site.' },
];

export default function VisibilityTab({ formData, onVisibilityToggle, onFooterEmailChange, onMarqueeChange }: Props) {
  return (
    <div className="space-y-6">
      {/* Module Visibility */}
      <div>
        <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4">Module Visibility</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {SECTION_TOGGLES.map(({ key, label, description }) => (
            <ToggleSwitch
              key={key}
              label={label}
              description={description}
              isChecked={formData.sections?.[key] ?? true}
              onChange={() => onVisibilityToggle(key)}
            />
          ))}
        </div>
      </div>

      <hr className="border-gray-200 dark:border-gray-800" />

      {/* Global Footer */}
      <div>
        <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4">Global Footer</h3>
        <div className="max-w-xl">
          <label className={labelCls}>Contact Email</label>
          <input
            type="email"
            value={formData.footer?.email || ''}
            onChange={(e) => onFooterEmailChange(e.target.value)}
            className={inputCls}
          />
        </div>
      </div>

      <hr className="border-gray-200 dark:border-gray-800" />

      {/* Marquee Skills */}
      <div>
        <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4">Marquee Skills</h3>
        <div>
          <label className={labelCls}>Skills List (comma separated)</label>
          <textarea
            value={formData.marquee?.join(', ') || ''}
            onChange={(e) => onMarqueeChange(e.target.value)}
            rows={4}
            className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  );
}
