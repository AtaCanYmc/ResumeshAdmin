import React from 'react';
import { Loader2 } from 'lucide-react';

const PageLoader: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
      <Loader2 className="w-8 h-8 text-blue-500 animate-spin" aria-hidden="true" />
      <p className="text-gray-500 dark:text-gray-400 font-medium">Sayfa yükleniyor...</p>
    </div>
  );
};

export default PageLoader;
