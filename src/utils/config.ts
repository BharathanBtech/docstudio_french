import { AppConfig } from '../types';

// Extend ImportMeta interface for Vite environment variables
declare global {
  interface ImportMeta {
    readonly env: {
      readonly VITE_LANGUAGE?: string;
      readonly VITE_API_BASE_URL?: string;
      readonly VITE_ACTIVEPIECES_API_KEY?: string;
      readonly VITE_EMAIL_TEMPLATES_URL?: string;
    };
  }
}

export const getConfig = (): AppConfig => {
  const language = import.meta.env.VITE_LANGUAGE || 'en';
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
  const apiKey = import.meta.env.VITE_ACTIVEPIECES_API_KEY || '';
  const emailTemplatesUrl = import.meta.env.VITE_EMAIL_TEMPLATES_URL;

  return {
    language,
    apiBaseUrl,
    apiKey,
    emailTemplatesUrl
  };
};

export const config = getConfig();
