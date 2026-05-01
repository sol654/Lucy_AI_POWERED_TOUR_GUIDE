import Constants from 'expo-constants';
import { Platform } from 'react-native';

const manifest = Constants.expoConfig ?? (Constants as any).manifest;
const extra = manifest?.extra ?? {};

const envApiUrl = typeof process !== 'undefined' ? process.env.EXPO_PUBLIC_API_URL : undefined;
const envGeoapifyKey = typeof process !== 'undefined' ? process.env.EXPO_PUBLIC_GEOAPIFY_API_KEY : undefined;

function normalizeLocalhostUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('http://localhost') || trimmed.startsWith('http://127.0.0.1')) {
    const port = trimmed.split(':').pop() || '8000';
    return Platform.OS === 'android' ? `http://10.0.2.2:${port}` : `http://127.0.0.1:${port}`;
  }
  return trimmed;
}

function getLocalHostUrl(): string {
  return Platform.OS === 'android' ? 'http://10.0.2.2:8000' : 'http://127.0.0.1:8000';
}

function getPackagerHostUrl(): string | undefined {
  const host = typeof manifest?.debuggerHost === 'string' ? manifest.debuggerHost.split(':')[0] : undefined;
  if (!host) return undefined;

  if (host === 'localhost' || host === '127.0.0.1') {
    return getLocalHostUrl();
  }

  return `http://${host}:8000`;
}

export const API_URL =
  normalizeLocalhostUrl(extra.apiUrl as string) ||
  normalizeLocalhostUrl(envApiUrl || '') ||
  getPackagerHostUrl() ||
  getLocalHostUrl();

export const GEOAPIFY_KEY =
  (extra.geoapifyKey as string) ||
  envGeoapifyKey ||
  '';

export function normalizeRemoteUrl(url: string): string {
  if (!url) return url;
  try {
    const parsed = new URL(url);
    const apiUrl = new URL(API_URL);

    if (['localhost', '127.0.0.1'].includes(parsed.hostname)) {
      return `${apiUrl.protocol}//${apiUrl.host}${parsed.pathname}${parsed.search}`;
    }

    // Android emulator may receive localhost/127.0.0.1 urls from the server.
    if (Platform.OS === 'android' && parsed.hostname === '127.0.0.1') {
      return `${apiUrl.protocol}//${apiUrl.host}${parsed.pathname}${parsed.search}`;
    }

    return url;
  } catch {
    return url;
  }
}

console.log('API_URL:', API_URL);
console.log('GEOAPIFY_KEY:', GEOAPIFY_KEY);
