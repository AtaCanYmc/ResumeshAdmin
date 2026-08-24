interface Props {
  label: string;
  description: string;
  isChecked: boolean;
  onChange: () => void;
}

export default function ToggleSwitch({ label, description, isChecked, onChange }: Props) {
  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-800">
      <div className="space-y-1">
        <span className="text-sm font-semibold text-gray-900 dark:text-white block">{label}</span>
        <span className="text-xs text-gray-500 dark:text-gray-400 block">{description}</span>
      </div>
      <button
        type="button"
        onClick={onChange}
        className={`${
          isChecked ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-800'
        } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shrink-0`}
      >
        <span
          className={`${
            isChecked ? 'translate-x-6' : 'translate-x-1'
          } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
        />
      </button>
    </div>
  );
}
