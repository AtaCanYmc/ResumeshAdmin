import React, { useState, Suspense } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  FolderGit,
  BookOpen,
  Briefcase,
  Award,
  Terminal,
  LogOut,
  Upload,
  Wand2,
  Menu,
  X,
  GraduationCap,
  Cloud,
  Box,
  Share2,
  Video,
  HardDrive,
  Settings
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import PageLoader from '../components/PageLoader';

export default function AdminLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const navItems = [
    { path: '/admin', label: 'Overview', icon: <LayoutDashboard size={20} />, end: true },
    { path: '/admin/projects', label: 'Projects', icon: <FolderGit size={20} />, end: false },
    { path: '/admin/articles', label: 'Articles', icon: <BookOpen size={20} />, end: false },
    { path: '/admin/packages', label: 'Packages', icon: <Box size={20} />, end: false },
    { path: '/admin/posts', label: 'Social Posts', icon: <Share2 size={20} />, end: false },
    { path: '/admin/videos', label: 'Videos', icon: <Video size={20} />, end: false },
    { path: '/admin/experiences', label: 'Experiences', icon: <Briefcase size={20} />, end: false },
    { path: '/admin/educations', label: 'Educations', icon: <GraduationCap size={20} />, end: false },
    { path: '/admin/skills', label: 'Skills', icon: <Wand2 size={20} />, end: false }, // Using Wand2 or create another icon for Skills
    { path: '/admin/certificates', label: 'Certificates', icon: <Award size={20} />, end: false },
    { path: '/admin/system-logs', label: 'System Logs', icon: <Terminal size={20} />, end: false },
    { path: '/admin/import-linkedin', label: 'Import LinkedIn', icon: <Upload size={20} />, end: false },
    { path: '/admin/ai-cv', label: 'AI CV Builder', icon: <Wand2 size={20} />, end: false },
    { path: '/admin/reactive-resume', label: 'Reactive Resume', icon: <Cloud size={20} />, end: false },
    { path: '/admin/storage', label: 'Supabase Storage', icon: <HardDrive size={20} />, end: false },
    { path: '/admin/settings', label: 'Settings', icon: <Settings size={20} />, end: false },
  ];

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-black text-gray-900 dark:text-gray-100 font-sans overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 transform transition-transform duration-300 lg:translate-x-0 lg:static lg:inset-auto ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } flex flex-col`}
      >
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200 dark:border-gray-800 shrink-0">
          <span className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-400 dark:from-blue-400 dark:to-emerald-400">
            ResuMesh Admin
          </span>
          <button
            className="lg:hidden text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              onClick={() => setIsSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-900 dark:hover:text-gray-200'
                }`
              }
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-200 dark:border-gray-800 shrink-0">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <header className="lg:hidden h-16 flex items-center justify-between px-4 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 shrink-0">
          <span className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-400 dark:from-blue-400 dark:to-emerald-400">
            ResuMesh Admin
          </span>
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded-lg focus:outline-none"
          >
            <Menu size={24} />
          </button>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto w-full">
            <Suspense fallback={<PageLoader />}>
              <Outlet />
            </Suspense>
          </div>
        </main>
      </div>
    </div>
  );
}
