import React, { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Check, Cpu, Eye, Globe, Share2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useEnv } from '../../hooks/useEnv';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import { AppSettings, HeroContent, IntegrationsConfig, LlmConfig, MetricItem, SectionVisibility } from '../../types';
import VisibilityTab from './app-settings/VisibilityTab';
import SocialsTab from './app-settings/SocialsTab';
import ContentTab from './app-settings/ContentTab';
import SystemTab from './app-settings/SystemTab';

type ActiveTab = 'visibility' | 'socials' | 'system' | 'content_en' | 'content_tr';

export default function AdminAppSettings() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const { ADMIN_API_URL } = useEnv();

  const [activeTab, setActiveTab] = useState<ActiveTab>('visibility');
  const [formData, setFormData] = useState<AppSettings | null>(null);

  // ─── Query ───────────────────────────────────────────────────────────────────

  const { data: settings, isLoading } = useQuery<AppSettings>({
    queryKey: ['admin-app-settings'],
    queryFn: async () => {
      const res = await axios.get(`${ADMIN_API_URL}/api/v1/settings/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return res.data;
    }
  });

  useEffect(() => {
    if (settings) {
      setFormData(JSON.parse(JSON.stringify(settings))); // deep copy
    }
  }, [settings]);

  // ─── Mutation ────────────────────────────────────────────────────────────────

  const updateMutation = useMutation({
    mutationFn: async (updatedData: AppSettings) => {
      const res = await axios.patch(`${ADMIN_API_URL}/api/v1/settings/`, updatedData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['admin-app-settings'], data);
      toast.success('Settings updated successfully.');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to update settings.');
    }
  });

  // ─── Handlers ────────────────────────────────────────────────────────────────

  const updateVisibility = (key: keyof SectionVisibility) => {
    setFormData((prev) => {
      if (!prev) return null;
      return { ...prev, sections: { ...prev.sections, [key]: !prev.sections?.[key] } };
    });
  };

  const updateIntegrations = (key: keyof IntegrationsConfig, value: string) => {
    setFormData((prev) => {
      if (!prev) return null;
      return { ...prev, integrations: { ...prev.integrations, [key]: value } };
    });
  };

  const updateLlm = (key: keyof LlmConfig, value: string) => {
    setFormData((prev) => {
      if (!prev) return null;
      return { ...prev, llm: { ...prev.llm, [key]: value } };
    });
  };

  const updateSocialUrl = (index: number, url: string) => {
    setFormData((prev) => {
      if (!prev) return null;
      const newSocials = [...(prev.socials ?? [])];
      newSocials[index] = { ...newSocials[index], url };
      return { ...prev, socials: newSocials };
    });
  };

  const updateSocialActive = (index: number) => {
    setFormData((prev) => {
      if (!prev) return null;
      const newSocials = [...(prev.socials ?? [])];
      const currentActive = newSocials[index].is_active !== false;
      newSocials[index] = { ...newSocials[index], is_active: !currentActive };
      return { ...prev, socials: newSocials };
    });
  };

  const handleHeroChange = (lang: 'en' | 'tr', field: keyof HeroContent, value: string) => {
    setFormData((prev) => {
      if (!prev) return null;
      const langContent = { ...prev[lang] };
      langContent.hero = { ...langContent.hero, [field]: value } as HeroContent;
      return { ...prev, [lang]: langContent };
    });
  };

  const handleMetricChange = (lang: 'en' | 'tr', index: number, field: keyof MetricItem, value: string | number) => {
    setFormData((prev) => {
      if (!prev) return null;
      const langContent = { ...prev[lang] };
      const newMetrics = [...(langContent?.metrics ?? [])];
      newMetrics[index] = { ...newMetrics[index], [field]: value };
      langContent!.metrics = newMetrics;
      return { ...prev, [lang]: langContent };
    });
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const uploadFormData = new FormData();
    uploadFormData.append('file', file);
    try {
      const res = await axios.post(`${ADMIN_API_URL}/api/v1/avatar/upload`, uploadFormData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      const newAvatarUrl = res.data.url;
      handleHeroChange('en', 'avatarImage', newAvatarUrl);
      handleHeroChange('tr', 'avatarImage', newAvatarUrl);
      toast.success('Profile picture uploaded to Supabase Storage!');
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to upload profile picture');
    }
  };

  // ─── Loading skeleton ─────────────────────────────────────────────────────────

  if (isLoading || !formData) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 w-48 bg-gray-300 dark:bg-gray-800 rounded" />
        <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded-xl" />
      </div>
    );
  }

  // ─── Tab class helper ─────────────────────────────────────────────────────────

  const tabCls = (tab: ActiveTab) =>
    `px-4 py-2 text-sm font-medium border-b-2 whitespace-nowrap transition-colors duration-200 cursor-pointer ${
      activeTab === tab
        ? 'border-blue-600 text-blue-600 dark:text-blue-400'
        : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white'
    }`;

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <AdminPageHeader
          title="App Settings"
          description="Configure your portfolio visibility, text configs, social links, and AI provider."
        />
        <button
          onClick={() => updateMutation.mutate(formData)}
          disabled={updateMutation.isPending}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-md flex items-center gap-2 cursor-pointer transition-colors duration-200 disabled:opacity-50 shrink-0 self-start sm:self-center"
        >
          <Check size={16} />
          {updateMutation.isPending ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-800 overflow-x-auto gap-2 scrollbar-none">
        <button onClick={() => setActiveTab('visibility')} className={tabCls('visibility')}>
          <div className="flex items-center gap-2"><Eye size={16} /><span>General &amp; Visibility</span></div>
        </button>
        <button onClick={() => setActiveTab('system')} className={tabCls('system')}>
          <div className="flex items-center gap-2"><Cpu size={16} /><span>AI &amp; System Config</span></div>
        </button>
        <button onClick={() => setActiveTab('socials')} className={tabCls('socials')}>
          <div className="flex items-center gap-2"><Share2 size={16} /><span>Social Links</span></div>
        </button>
        <button onClick={() => setActiveTab('content_en')} className={tabCls('content_en')}>
          <div className="flex items-center gap-2"><Globe size={16} /><span>English Content</span></div>
        </button>
        <button onClick={() => setActiveTab('content_tr')} className={tabCls('content_tr')}>
          <div className="flex items-center gap-2"><Globe size={16} /><span>Turkish Content</span></div>
        </button>
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden p-6">
        {activeTab === 'visibility' && (
          <VisibilityTab
            formData={formData}
            onVisibilityToggle={updateVisibility}
            onFooterEmailChange={(email) =>
              setFormData((prev) => prev ? { ...prev, footer: { email } } : null)
            }
            onMarqueeChange={(value) =>
              setFormData((prev) => prev ? { ...prev, marquee: value.split(',').map((s) => s.trim()) } : null)
            }
          />
        )}

        {activeTab === 'system' && (
          <SystemTab
            formData={formData}
            onIntegrationsChange={updateIntegrations}
            onLlmChange={updateLlm}
          />
        )}

        {activeTab === 'socials' && (
          <SocialsTab
            socials={formData.socials ?? []}
            onUrlChange={updateSocialUrl}
            onActiveToggle={updateSocialActive}
          />
        )}

        {(activeTab === 'content_en' || activeTab === 'content_tr') && (() => {
          const lang = activeTab === 'content_en' ? 'en' : 'tr';
          const content = formData[lang];
          if (!content) {
            return <p className="text-sm text-gray-500">No content available for {lang.toUpperCase()}.</p>;
          }
          return (
            <ContentTab
              lang={lang}
              content={content}
              onHeroChange={handleHeroChange}
              onMetricChange={handleMetricChange}
              onAvatarUpload={handleAvatarUpload}
            />
          );
        })()}
      </div>
    </div>
  );
}
