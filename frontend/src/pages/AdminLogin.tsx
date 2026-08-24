import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ShieldAlert, Loader2, KeyRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useEnv } from '../hooks/useEnv';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import toast from 'react-hot-toast';
import { supabase } from '../services/supabase';

// Zod Schema for validation
const loginSchema = z.object({
  username: z.string().min(1, 'Kullanıcı adı veya E-posta boş bırakılamaz.'),
  password: z.string().min(6, 'Şifre en az 6 karakter olmalıdır.'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function AdminLogin() {
  const { login } = useAuth();
  const { SUPABASE_URL, ADMIN_API_URL } = useEnv();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setError(null);

    // Fallback: if Supabase config is missing, fall back to backend login (useful for tests)
    const supabaseUrl = SUPABASE_URL || '';
    if (!supabaseUrl) {
      try {
        const apiUrl = ADMIN_API_URL || 'http://localhost:8001';
        const formData = new URLSearchParams();
        formData.append('username', data.username);
        formData.append('password', data.password);

        const response = await axios.post(`${apiUrl}/api/v1/auth/login`, formData, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        });

        login(response.data.access_token);
        toast.success('Başarıyla giriş yapıldı!');
        navigate('/admin');
        return;
      } catch (err: any) {
        console.error(err);
        if (err.response?.status === 401) {
          setError('Kullanıcı adı veya şifre hatalı.');
          toast.error('Kullanıcı adı veya şifre hatalı.');
        } else {
          setError('Giriş yapılırken bir hata oluştu.');
          toast.error('Giriş yapılırken bir hata oluştu.');
        }
        return;
      }
    }

    try {
      const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
        email: data.username,
        password: data.password,
      });

      if (authErr) {
        throw authErr;
      }

      if (authData.session) {
        login(authData.session.access_token);
        toast.success('Başarıyla giriş yapıldı!');
        navigate('/admin');
      } else {
        throw new Error('Giriş başarısız.');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Kullanıcı adı veya şifre hatalı.');
      toast.error(err.message || 'Kullanıcı adı veya şifre hatalı.');
    }
  };

  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 flex items-center justify-center font-sans p-4">
      <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-2xl p-8 w-full max-w-md">
        <div className="flex justify-center mb-6">
          <div className="p-3 bg-blue-100 dark:bg-blue-500/10 rounded-full">
            <KeyRound className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-center mb-2">Yönetici Girişi</h2>
        <p className="text-neutral-500 dark:text-neutral-400 text-center mb-8">Sistemi yönetmek için giriş yapın</p>

        {error && (
          <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/50 text-red-600 dark:text-red-400 p-3 rounded-lg flex items-center gap-3 mb-6">
            <ShieldAlert className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-400 mb-1">
              Kullanıcı Adı veya E-posta
            </label>
            <input
              type="text"
              {...register('username')}
              className={`w-full px-4 py-2 bg-white dark:bg-neutral-900 border ${
                errors.username ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-neutral-300 dark:border-neutral-700 focus:border-blue-500 focus:ring-blue-500'
              } rounded-lg focus:outline-none focus:ring-1 text-neutral-900 dark:text-neutral-100 transition-colors`}
              placeholder="admin@example.com"
            />
            {errors.username && (
              <p className="text-red-500 text-xs mt-1 font-medium">{errors.username.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-400 mb-1">
              Şifre
            </label>
            <input
              type="password"
              {...register('password')}
              className={`w-full px-4 py-2 bg-white dark:bg-neutral-900 border ${
                errors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-neutral-300 dark:border-neutral-700 focus:border-blue-500 focus:ring-blue-500'
              } rounded-lg focus:outline-none focus:ring-1 text-neutral-900 dark:text-neutral-100 transition-colors`}
              placeholder="••••••••"
            />
            {errors.password && (
              <p className="text-red-500 text-xs mt-1 font-medium">{errors.password.message}</p>
            )}
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors font-medium mt-6 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-neutral-900"
          >
            {isSubmitting ? <Loader2 className="animate-spin w-5 h-5" aria-hidden="true" /> : null}
            {isSubmitting ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
          </button>
        </form>
      </div>
    </div>
  );
}
