import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import posthog from 'posthog-js'
import './index.css'
import './i18n/config'
import App from './App.tsx'

if (import.meta.env.VITE_POSTHOG_API_KEY && import.meta.env.MODE !== 'development') {
  posthog.init(import.meta.env.VITE_POSTHOG_API_KEY, {
    api_host: import.meta.env.VITE_POSTHOG_HOST || 'https://us.i.posthog.com',
    autocapture: false,
    capture_pageview: true,
    persistence: 'localStorage',
    sanitize_properties: (properties) => {
      return properties;
    }
  });
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
