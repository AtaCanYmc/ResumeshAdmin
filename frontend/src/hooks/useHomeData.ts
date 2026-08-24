import { useQuery, keepPreviousData } from '@tanstack/react-query';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface SocialLinkItem {
  id: string;
  platform: string;
  url: string;
  label: string;
  icon?: string;
  order_index?: number;
  is_active?: boolean;
}

export interface ContentConfig {
  hero: {
    name: string;
    title: string;
    description: string;
    resumeLink: string;
  };
  socials: SocialLinkItem[];
  metrics: {
    id: number;
    icon: string;
    value: string;
    label: string;
    color: string;
  }[];
  marquee: string[];
  footer: {
    email: string;
    aboutTitle: string;
    aboutText: string;
  };
}

export const useAppSettings = () => {
  return useQuery({
    queryKey: ['admin-app-settings'],
    queryFn: async () => {
      try {
        const response = await axios.get(`${API_URL}/api/v1/settings/`);
        return response.data;
      } catch (err) {
        console.warn('Failed to fetch settings from API', err);
        return {
          show_projects: true,
          show_certificates: true,
          show_videos: true,
          show_experiences: true,
        };
      }
    },
    staleTime: 1000 * 60 * 10,
  });
};

export const useContentConfig = (lang: string = 'tr') => {
  return useQuery<ContentConfig>({
    queryKey: ['admin-contentConfig', lang],
    queryFn: async () => {
      try {
        const response = await axios.get('/content.json');
        const shortLang = lang.split('-')[0].toLowerCase();
        const langData =
          response.data[shortLang] ||
          response.data[lang] ||
          response.data['en'] ||
          {};
        return {
          ...langData,
          socials: response.data.socials || [],
          footer: response.data.footer || {},
          marquee: response.data.marquee || [],
        };
      } catch (err) {
        console.warn('Failed to load content.json', err);
        return {
          hero: {
            name: 'Ata Can',
            title: 'Computer Engineer',
            description: '',
            resumeLink: '/resumes/resume.pdf',
          },
          socials: [],
          metrics: [],
          marquee: [],
          footer: { email: '', aboutTitle: '', aboutText: '' },
        };
      }
    },
    staleTime: Infinity,
    placeholderData: keepPreviousData,
  });
};

export const useExperiences = () => {
  return useQuery({
    queryKey: ['experiences'],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/api/v1/experiences/`);
      return response.data;
    },
  });
};
