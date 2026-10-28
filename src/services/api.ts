import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Detecção inteligente de IP para que funcione perfeitamente no Celular (Expo Go) e na Web
const getBaseUrl = (): string => {
  // Se for Web, localhost:3001
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && window.location && window.location.hostname) {
      return `http://${window.location.hostname}:3001/api`;
    }
    return 'http://localhost:3001/api';
  }

  // Se for celular (Expo Go / Android / iOS)
  // Constants.expoConfig?.hostUri pega o IP da máquina na rede local automaticamente (ex: 10.0.0.181:8081)
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const ip = hostUri.split(':')[0];
    if (ip && ip !== 'localhost' && ip !== '127.0.0.1') {
      return `http://${ip}:3001/api`;
    }
  }

  // Fallback para o IP da máquina na rede local
  return 'http://10.0.0.181:3001/api';
};

export const API_BASE_URL = getBaseUrl();

interface RequestOptions {
  timeoutMs?: number;
}

export async function apiRequest<T = any>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  body?: any,
  options: RequestOptions = { timeoutMs: 7000 }
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), options.timeoutMs || 7000);

  try {
    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const json = await res.json();
    return json;
  } catch (error: any) {
    clearTimeout(timeoutId);
    console.warn(`[API] Erro ou timeout na requisição ${method} ${url}:`, error?.message);
    throw error;
  }
}

export const api = {
  get: <T = any>(endpoint: string, options?: RequestOptions) =>
    apiRequest<T>(endpoint, 'GET', undefined, options),
  post: <T = any>(endpoint: string, body?: any, options?: RequestOptions) =>
    apiRequest<T>(endpoint, 'POST', body, options),
  put: <T = any>(endpoint: string, body?: any, options?: RequestOptions) =>
    apiRequest<T>(endpoint, 'PUT', body, options),
  delete: <T = any>(endpoint: string, options?: RequestOptions) =>
    apiRequest<T>(endpoint, 'DELETE', undefined, options),
};
