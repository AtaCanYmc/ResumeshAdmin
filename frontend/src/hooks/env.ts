export const ENV = {
  API_URL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  ADMIN_API_URL: import.meta.env.VITE_ADMIN_API_URL || 'http://localhost:8001',
  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL || '',
  SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
  ENVIRONMENT: import.meta.env.VITE_ENVIRONMENT || 'development',
  CV_FILENAME: import.meta.env.VITE_CV_FILENAME || 'cv.pdf',
  POSTHOG_API_KEY: import.meta.env.VITE_POSTHOG_API_KEY || '',
  POSTHOG_HOST: import.meta.env.VITE_POSTHOG_HOST || 'https://us.i.posthog.com',
  MODE: import.meta.env.MODE || 'development',
  GITHUB_USERNAME: import.meta.env.VITE_GITHUB_USERNAME || '',
};
