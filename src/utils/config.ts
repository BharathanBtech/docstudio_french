import { AppConfig } from '../types';

// Extend ImportMeta interface for Vite environment variables
declare global {
  interface ImportMeta {
    readonly env: {
      readonly VITE_LANGUAGE?: string;
      readonly VITE_API_BASE_URL?: string;
      readonly VITE_ACTIVEPIECES_API_KEY?: string;
    };
  }
}

export const getConfig = (): AppConfig => {
  const language = import.meta.env.VITE_LANGUAGE || 'en';
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
  const apiKey = import.meta.env.VITE_ACTIVEPIECES_API_KEY || '';

  return {
    language,
    apiBaseUrl,
    apiKey
  };
};

export const config = getConfig();
