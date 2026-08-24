import axios from 'axios';
import { ENV } from '../hooks/env';
import { SystemLog } from '../types';

const API_URL = ENV.ADMIN_API_URL;

export const fetchSystemLogs = async (
  token: string,
  page: number = 1,
  level?: string,
  module?: string,
  searchQuery?: string,
  startDate?: string,
  endDate?: string
) => {
  const params = new URLSearchParams();
  params.append('page', page.toString());
  if (level) params.append('level', level);
  if (module) params.append('module', module);
  if (searchQuery) params.append('search_query', searchQuery);
  if (startDate) params.append('start_date', startDate);
  if (endDate) params.append('end_date', endDate);

  const response = await axios.get(`${API_URL}/api/v1/admin/logs?${params.toString()}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

// Skills
export const fetchSkills = async () => {
  const response = await axios.get(`${API_URL}/api/v1/skills/`);
  return response.data;
};

export const createSkill = async (data: any, token: string) => {
  const response = await axios.post(`${API_URL}/api/v1/skills/`, data, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const updateSkill = async (id: string, data: any, token: string) => {
  const response = await axios.put(`${API_URL}/api/v1/skills/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const deleteSkill = async (id: string, token: string) => {
  const response = await axios.delete(`${API_URL}/api/v1/skills/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};
