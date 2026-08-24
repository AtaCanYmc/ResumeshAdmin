import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Loader2, Server } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useEnv } from '../hooks/useEnv';

interface ServerWakeupGateProps {
  children: React.ReactNode;
}

const ServerWakeupGate: React.FC<ServerWakeupGateProps> = ({ children }) => {
  const { ADMIN_API_URL } = useEnv();
  const [isAwake, setIsAwake] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [dots, setDots] = useState<string>('');
  const { t } = useTranslation();

  const apiUrl = ADMIN_API_URL;

  useEffect(() => {
    let intervalId: any;
    let isActive = true;

    const checkServer = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/v1/health`, { timeout: 3000 });
        if (response.status === 200 && isActive) {
          setIsAwake(true);
          setLoading(false);
          clearInterval(intervalId);
        }
      } catch (error) {
        console.log('Waiting for backend server to wake up...');
      }
    };

    // Initial check
    checkServer();

    // Poll every 3 seconds
    intervalId = setInterval(checkServer, 3000);

    return () => {
      isActive = false;
      clearInterval(intervalId);
    };
  }, [apiUrl]);

  // Dots animation
  useEffect(() => {
    if (!loading) return;
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : prev + '.'));
    }, 500);
    return () => clearInterval(interval);
  }, [loading]);

  if (!isAwake) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-950 text-neutral-100 font-sans p-6 selection:bg-blue-500/30">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 max-w-md w-full text-center space-y-8 bg-neutral-900/40 border border-neutral-800/80 p-8 rounded-2xl backdrop-blur-md shadow-2xl">
          {/* Animated Icon */}
          <div className="relative flex justify-center">
            <div className="relative p-5 bg-neutral-900 border border-neutral-800 rounded-full shadow-inner group">
              <Server className="w-10 h-10 text-neutral-400 group-hover:text-blue-400 transition-colors duration-300" />
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-blue-500"></span>
              </span>
            </div>
          </div>

          {/* Texts */}
          <div className="space-y-3">
            <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-neutral-100 via-neutral-200 to-neutral-400 bg-clip-text text-transparent">
              {t('wakeup.title')}{dots}
            </h1>
            <p className="text-sm text-neutral-400 leading-relaxed max-w-sm mx-auto">
              {t('wakeup.description')}
            </p>
          </div>

          {/* Status Indicator */}
          <div className="pt-2">
            <div className="inline-flex items-center gap-2.5 px-4 py-2 bg-neutral-900/80 border border-neutral-800 rounded-full text-xs font-medium text-neutral-400">
              <Loader2 className="w-3.5 h-3.5 text-blue-500 animate-spin" />
              <span>{t('wakeup.status')}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ServerWakeupGate;
