import React from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ErrorBoundary from './components/ui/ErrorBoundary';
import { HelmetProvider } from 'react-helmet-async';

// Lazy loading pages for Code Splitting

const AdminLogin = React.lazy(() => import('./pages/AdminLogin'));

// Admin Workspace Pages
const AdminLayout = React.lazy(() => import('./layouts/AdminLayout'));
const AdminOverview = React.lazy(() => import('./pages/admin/AdminOverview'));
const AdminProjects = React.lazy(() => import('./pages/admin/AdminProjects'));
const AdminArticles = React.lazy(() => import('./pages/admin/AdminArticles'));
const AdminExperiences = React.lazy(() => import('./pages/admin/AdminExperiences'));
const AdminEducations = React.lazy(() => import('./pages/admin/AdminEducations'));
const AdminSkills = React.lazy(() => import('./pages/admin/AdminSkills'));
const AdminCertificates = React.lazy(() => import('./pages/admin/AdminCertificates'));
const AdminSystemLogs = React.lazy(() => import('./pages/admin/AdminSystemLogs'));
const AdminLinkedInImport = React.lazy(() => import('./pages/admin/AdminLinkedInImport'));
const AdminAiCv = React.lazy(() => import('./pages/admin/AdminAiCv'));
const AdminReactiveResume = React.lazy(() => import('./pages/admin/AdminReactiveResume'));
const AdminPackages = React.lazy(() => import('./pages/admin/AdminPackages'));
const AdminPosts = React.lazy(() => import('./pages/admin/AdminPosts'));
const AdminVideos = React.lazy(() => import('./pages/admin/AdminVideos'));
const AdminStorage = React.lazy(() => import('./pages/admin/AdminStorage'));
const AdminAppSettings = React.lazy(() => import('./pages/admin/AdminAppSettings'));


// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Create browser router with error boundaries
const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/admin" replace />,
    errorElement: <ErrorBoundary />,
  },
  {
    path: '/admin/login',
    element: <AdminLogin />,
    errorElement: <ErrorBoundary />,
  },
  {
    path: '/admin',
    element: (
      <ProtectedRoute>
        <AdminLayout />
      </ProtectedRoute>
    ),
    errorElement: <ErrorBoundary />,
    children: [
      { index: true, element: <AdminOverview /> },
      { path: 'projects', element: <AdminProjects /> },
      { path: 'articles', element: <AdminArticles /> },
      { path: 'experiences', element: <AdminExperiences /> },
      { path: 'educations', element: <AdminEducations /> },
      { path: 'skills', element: <AdminSkills /> },
      { path: 'certificates', element: <AdminCertificates /> },
      { path: 'system-logs', element: <AdminSystemLogs /> },
      { path: 'import-linkedin', element: <AdminLinkedInImport /> },
      { path: 'ai-cv', element: <AdminAiCv /> },
      { path: 'reactive-resume', element: <AdminReactiveResume /> },
      { path: 'packages', element: <AdminPackages /> },
      { path: 'posts', element: <AdminPosts /> },
      { path: 'videos', element: <AdminVideos /> },
      { path: 'storage', element: <AdminStorage /> },
      { path: 'settings', element: <AdminAppSettings /> },
    ],
  },
]);


import { Analytics } from '@vercel/analytics/react';
import ServerWakeupGate from './components/ServerWakeupGate';

function App() {
  return (
    <HelmetProvider>
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              className: 'dark:bg-gray-800 dark:text-white border dark:border-gray-700',
              style: {
                background: 'var(--toast-bg, #333)',
                color: 'var(--toast-color, #fff)',
              },
            }}
          />
          {/* Suspense is moved to MainLayout so layout stays intact during page loads */}
          <ServerWakeupGate>
            <RouterProvider router={router} />
          </ServerWakeupGate>
          <Analytics />
        </AuthProvider>
      </QueryClientProvider>
      </ThemeProvider>
    </HelmetProvider>
  );
}

export default App;
