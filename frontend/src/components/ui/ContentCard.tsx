import React from 'react';
import { cn } from '../../lib/utils';
import { ExternalLink } from 'lucide-react';

interface ContentCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  tags?: string[];
  icon?: React.ReactNode;
  externalLink?: string;
  footerContent?: React.ReactNode;
}

export const ContentCard = React.forwardRef<HTMLDivElement, ContentCardProps>(
  ({ className, title, description, tags, icon, externalLink, footerContent, onClick, ...props }, ref) => {

    // Handle accessibility for clickable cards
    const clickableProps = onClick ? {
      role: "button",
      tabIndex: 0,
      onKeyDown: (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick(e as any);
        }
      },
      onClick
    } : {};

    return (
      <div
        ref={ref}
        className={cn(
          "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 flex flex-col transition-all duration-300 ease-out group shadow-sm outline-none h-full min-h-[220px]",
          onClick ? "cursor-pointer hover:border-gray-400 dark:hover:border-gray-600 hover:-translate-y-1 hover:shadow-lg focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-blue-500" : "",
          className
        )}
        {...clickableProps}
        {...props}
      >
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1" title={title}>
            {title}
          </h3>
          {externalLink && (
            <a
              href={externalLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-gray-400 hover:text-gray-900 dark:text-gray-500 dark:hover:text-white transition-colors focus-visible:ring-2 focus-visible:ring-blue-500 rounded-sm"
              aria-label={`${title} linkine git`}
            >
              {icon || <ExternalLink size={20} />}
            </a>
          )}
          {!externalLink && icon && (
             <div className="text-gray-400 dark:text-gray-500">{icon}</div>
          )}
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-400 flex-1 mb-6 line-clamp-3">
          {description || 'Açıklama bulunmuyor.'}
        </p>

        <div className="flex items-end justify-between mt-auto gap-4">
          {tags && tags.length > 0 && (
            <div className="flex gap-2 flex-wrap flex-1">
              {tags.slice(0, 3).map((tag, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-md border border-gray-200 dark:border-gray-700 whitespace-nowrap"
                  title={tag}
                >
                  {tag}
                </span>
              ))}
              {tags.length > 3 && (
                <span className="px-2.5 py-1 text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-md border border-gray-200 dark:border-gray-700">
                  +{tags.length - 3}
                </span>
              )}
            </div>
          )}
          {footerContent && (
            <div className="flex items-center space-x-3 text-xs font-medium text-gray-500 dark:text-gray-400 ml-auto flex-shrink-0">
              {footerContent}
            </div>
          )}
        </div>
      </div>
    );
  }
);

ContentCard.displayName = "ContentCard";
