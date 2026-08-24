import { SocialItem } from '../../../types';

interface Props {
  socials: SocialItem[];
  onUrlChange: (index: number, url: string) => void;
  onActiveToggle: (index: number) => void;
}

export default function SocialsTab({ socials, onUrlChange, onActiveToggle }: Props) {
  return (
    <div className="space-y-6">
      <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">Social Media Accounts</h3>
      <div className="space-y-4 max-w-2xl">
        {socials.map((social, index) => (
          <div
            key={social.id || index}
            className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-900 dark:text-white">{social.label}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                  social.is_active !== false
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                }`}>
                  {social.is_active !== false ? 'Active' : 'Disabled'}
                </span>
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400 block">
                Configure URL and active status for {social.platform}.
              </span>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-2/3">
              <input
                type="url"
                value={social.url}
                onChange={(e) => onUrlChange(index, e.target.value)}
                placeholder="https://..."
                className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-800 rounded-xl px-4 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => onActiveToggle(index)}
                className={`${
                  social.is_active !== false ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-800'
                } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 shrink-0`}
                title="Toggle active status"
              >
                <span
                  className={`${
                    social.is_active !== false ? 'translate-x-6' : 'translate-x-1'
                  } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
