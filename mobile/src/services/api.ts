import axios, { AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  AuthToken, HeritageSite, Favorite, Journey, JourneySite,
  QueryResponse, VoiceQueryResponse, User, Feedback, AdminStats,
} from '../types';
import { API_URL } from '../config';

const BASE_URL = API_URL;

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 60000,
  maxRedirects: 5,
});

api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const token = await AsyncStorage.getItem('access_token');
  if (!config.headers) {
    config.headers = {} as any;
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (!(config.data instanceof FormData) && !config.headers['Content-Type']) {
    config.headers['Content-Type'] = 'application/json';
  }

  return config;
});

// Auto-clear expired token on 401 so user gets redirected to login
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error?.response?.status === 401) {
      await AsyncStorage.multiRemove(['access_token', 'user']);
    }
    return Promise.reject(error);
  }
);

// Auth
export const register = (name: string, email: string, password: string, securityQuestion: string, securityAnswer: string): Promise<AuthToken> =>
  api.post('/auth/register', { name, email, password, security_question: securityQuestion, security_answer: securityAnswer }).then((r: AxiosResponse<AuthToken>) => r.data);

export const login = (email: string, password: string): Promise<AuthToken> =>
  api.post('/auth/login', { email, password }).then((r: AxiosResponse<AuthToken>) => r.data);

export const forgotPassword = (email: string, securityAnswer: string, newPassword: string): Promise<{ message: string }> =>
  api.post('/auth/forgot-password', { email, security_answer: securityAnswer, new_password: newPassword }).then((r: AxiosResponse<{ message: string }>) => r.data);

export const changePassword = (currentPassword: string, newPassword: string): Promise<{ message: string }> =>
  api.post('/auth/change-password', { current_password: currentPassword, new_password: newPassword }).then((r: AxiosResponse<{ message: string }>) => r.data);

export const updateProfile = (payload: { name?: string; language_preference?: string; profile_picture_url?: string }): Promise<User> =>
  api.put('/auth/profile', payload).then((r: AxiosResponse<User>) => r.data);

export const uploadProfilePicture = (formData: FormData): Promise<{ url: string; blob: string }> =>
  api.post('/storage/profile-picture', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then((r: AxiosResponse<{ url: string; blob: string }>) => r.data);

// Heritage Sites
export const getSites = (): Promise<HeritageSite[]> =>
  api.get('/sites/').then((r: AxiosResponse<HeritageSite[]>) => r.data);

export const getSite = (id: string): Promise<HeritageSite> =>
  api.get(`/sites/${id}`).then((r: AxiosResponse<HeritageSite>) => r.data);

// AI Query
export const textQuery = (text: string, language = 'en'): Promise<QueryResponse> =>
  api.post('/ai/query', { text, language }).then((r: AxiosResponse<QueryResponse>) => r.data);

export const audioGuide = (text: string, language = 'en'): Promise<QueryResponse> =>
  api.post('/ai/query', { text, language, include_audio: true }, { timeout: 90000 }).then((r: AxiosResponse<QueryResponse>) => r.data);

export const voiceQuery = async (audioUri: string): Promise<VoiceQueryResponse> => {
  const form = new FormData();
  // Expo records as .m4a on Android/iOS — use correct mime type
  const ext = audioUri.split('.').pop()?.toLowerCase() || 'm4a';
  const mimeMap: Record<string, string> = {
    m4a: 'audio/m4a',
    mp4: 'audio/mp4',
    wav: 'audio/wav',
    mp3: 'audio/mpeg',
    ogg: 'audio/ogg',
    webm: 'audio/webm',
  };
  const mimeType = mimeMap[ext] ?? 'audio/m4a';
  form.append('audio', { uri: audioUri, name: `audio.${ext}`, type: mimeType } as unknown as Blob);
  const r: AxiosResponse<VoiceQueryResponse> = await api.post('/ai/voice', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return r.data;
};

// Favorites
export const getFavorites = (): Promise<Favorite[]> =>
  api.get('/favorites/').then((r: AxiosResponse<Favorite[]>) => r.data);

export const addFavorite = (heritage_site_id: string): Promise<Favorite> =>
  api.post('/favorites/', { heritage_site_id }).then((r: AxiosResponse<Favorite>) => r.data);

export const removeFavorite = (id: string): Promise<void> =>
  api.delete(`/favorites/${id}`).then(() => undefined);

// Journeys
export const getJourneys = (): Promise<Journey[]> =>
  api.get('/journeys/').then((r: AxiosResponse<Journey[]>) => r.data);

export const createJourney = (title: string): Promise<Journey> =>
  api.post('/journeys/', { title }).then((r: AxiosResponse<Journey>) => r.data);

export const deleteJourney = (journeyId: string): Promise<void> =>
  api.delete(`/journeys/${journeyId}`).then(() => undefined);

export const getJourneySites = (journeyId: string): Promise<JourneySite[]> =>
  api.get(`/journeys/${journeyId}/sites`).then((r: AxiosResponse<JourneySite[]>) => r.data);

export const addSiteToJourney = (journeyId: string, heritage_site_id: string, order_index = 0): Promise<void> =>
  api.post(`/journeys/${journeyId}/sites`, { heritage_site_id, order_index }).then(() => undefined);

// Feedback
export const submitFeedback = (message: string, rating?: number): Promise<void> =>
  api.post('/feedback/', { message, rating }).then(() => undefined);

// Admin
export const getAdminStats = (): Promise<AdminStats> =>
  api.get('/admin/stats').then((r: AxiosResponse<AdminStats>) => r.data);

export const getAdminUsers = (): Promise<User[]> =>
  api.get('/admin/users').then((r: AxiosResponse<User[]>) => r.data);

export const deleteUser = (userId: string): Promise<void> =>
  api.delete(`/admin/users/${userId}`).then(() => undefined);

export const updateUserRole = (userId: string, role: 'user' | 'admin'): Promise<User> =>
  api.patch(`/admin/users/${userId}/role`, { role }).then((r: AxiosResponse<User>) => r.data);

export const createSite = (payload: Omit<HeritageSite, 'id' | 'created_at'>): Promise<HeritageSite> =>
  api.post('/admin/sites', payload).then((r: AxiosResponse<HeritageSite>) => r.data);

export const updateSite = (id: string, payload: Partial<Omit<HeritageSite, 'id' | 'created_at'>>): Promise<HeritageSite> =>
  api.put(`/admin/sites/${id}`, payload).then((r: AxiosResponse<HeritageSite>) => r.data);

export const deleteSite = (id: string): Promise<void> =>
  api.delete(`/admin/sites/${id}`).then(() => undefined);

export const getAdminFeedback = (): Promise<Feedback[]> =>
  api.get('/admin/feedback').then((r: AxiosResponse<Feedback[]>) => r.data);

export const deleteFeedback = (id: string): Promise<void> =>
  api.delete(`/admin/feedback/${id}`).then(() => undefined);

export default api;
