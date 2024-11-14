import axios from 'axios';
import { ShortLink, CreateLinkResponse, ClickEvent } from '../types';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  withCredentials: true
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // Log the request configuration
  console.log('Request Config:', {
    url: config.url,
    method: config.method,
    data: config.data,
    headers: config.headers,
  });
  return config;
});

api.interceptors.response.use(
  (response) => {
    console.log('Response:', response.data);
    return response;
  },
  (error) => {
    console.error('API Error:', {
      status: error.response?.status,
      data: error.response?.data,
      config: error.config,
    });
    return Promise.reject(error);
  }
);

export const authService = {
  login: async (email: string, password: string) => {
    const response = await api.post('/login', { email, password });
    return response.data;
  },
  register: async (email: string, password: string) => {
    const response = await api.post('/register', { email, password });
    return response.data;
  },
};

export const linkService = {
  createLink: async (originalUrl: string): Promise<CreateLinkResponse> => {
    try {
      console.log('Creating link with URL:', originalUrl);
      const response = await api.post<CreateLinkResponse>('/api/links', {
        original_url: originalUrl, // Change to match Go struct field name
      });
      return response.data;
    } catch (error) {
      console.error('Create link error:', error);
      throw error;
    }
  },

  getLinks: async (): Promise<ShortLink[]> => {
    const response = await api.get<any[]>('/api/links');
    return response.data.map(link => ({
      id: link.id,
      shortCode: link.short_code,
      originalUrl: link.original_url,
      userId: link.user_id,
      isActive: link.is_active,
      clicks: link.clicks,
      createdAt: link.created_at
    }));
  },

  toggleLink: async (id: number): Promise<ShortLink> => {
    const response = await api.put<ShortLink>(`/api/links/${id}/toggle`);
    return response.data;
  },

  getLinkStats: async (id: number) => {
    const response = await api.get(`/api/links/${id}/stats`);
    return response.data;
  },

  getAllClicks: async (): Promise<ClickEvent[]> => {
    const response = await api.get<ClickEvent[]>('/api/clicks');
    return response.data;
  },
};