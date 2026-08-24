import React, { useState } from 'react';
import { cn } from '../../lib/utils';
import { Image as ImageIcon } from 'lucide-react';

interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallback?: React.ReactNode;
}

export const LazyImage: React.FC<ImageProps> = ({ className, src, alt, fallback, ...props }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  return (
    <div className={cn("relative overflow-hidden bg-gray-100 dark:bg-gray-800", className)}>
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-full h-full animate-pulse bg-gray-200 dark:bg-gray-700" />
        </div>
      )}

      {hasError ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 dark:text-gray-500">
          {fallback || <ImageIcon className="w-8 h-8 mb-2 opacity-50" />}
          <span className="text-xs font-medium">Görsel Yüklenemedi</span>
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          className={cn(
            "w-full h-full object-cover transition-opacity duration-500 ease-in-out",
            isLoaded ? "opacity-100" : "opacity-0"
          )}
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
          {...props}
        />
      )}
    </div>
  );
};

export default LazyImage;
