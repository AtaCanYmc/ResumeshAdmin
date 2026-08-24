import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertOctagon } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[40vh] p-8 text-center bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-200 dark:border-red-900/30">
          <AlertOctagon className="w-16 h-16 text-red-500 mb-4" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-red-400 mb-2">
            Bir Şeyler Yanlış Gitti
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-md">
            Veriler yüklenirken veya işlenirken bir hata oluştu. Lütfen sayfayı yenilemeyi deneyin veya daha sonra tekrar dönün.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
          >
            Sayfayı Yenile
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
