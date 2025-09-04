import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { config } from '../utils/config';
import {
  EmailTemplate,
  SmsTemplate,
  SendEmailRequest,
  SendSmsRequest,
  ApiResponse,
  TransactionResult
} from '../types';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: config.apiBaseUrl,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`
      }
    });

    this.api.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error) => {
        console.error('API Error:', error);
        throw new Error(error.response?.data?.message || error.message || 'Network error');
      }
    );
  }

  // Email Templates (supports override webhook URL)
  async getEmailTemplates(): Promise<EmailTemplate[]> {
    if (config.emailTemplatesUrl) {
      try {
        console.log('[EmailTemplates] Fetching via webhook URL:', config.emailTemplatesUrl);
        const response = await axios.get(config.emailTemplatesUrl, {
          headers: { 'Content-Type': 'application/json' }
        });
        console.log('[EmailTemplates] Raw response:', response.status, response.data);
        const payload = response.data;
        const normalize = (arr: any[]): EmailTemplate[] => arr.map((item: any, idx: number) => ({
          // Store communicationId as the id we will POST later
          id: String(item.communicationId ?? item.id ?? item.templateId ?? idx),
          name: String(item.name ?? item.title ?? `Template ${idx + 1}`),
          subject: String(item.subject ?? ''),
          content: String(item.content ?? '')
        }));
        if (Array.isArray(payload)) {
          const out = normalize(payload);
          console.log('[EmailTemplates] Normalized templates:', out);
          return out;
        }
        if (payload?.data && Array.isArray(payload.data)) {
          const out = normalize(payload.data);
          console.log('[EmailTemplates] Normalized templates from .data:', out);
          return out;
        }
        console.warn('[EmailTemplates] Unexpected payload shape, returning empty list');
        return [];
      } catch (err: any) {
        console.error('[EmailTemplates] Error fetching templates via webhook:', err?.message || err);
        return [];
      }
    }

    const response = await this.api.get<ApiResponse<EmailTemplate[]>>('/email-templates');
    console.log('[EmailTemplates] Fallback API response:', response.data);
    return response.data.data || [];
  }

  async getSmsTemplates(): Promise<SmsTemplate[]> {
    const response = await this.api.get<ApiResponse<SmsTemplate[]>>('/sms-templates');
    return response.data.data || [];
  }

  async sendEmail(request: SendEmailRequest): Promise<TransactionResult> {
    console.log('[SendEmail] Payload:', request);
    const response = await this.api.post<ApiResponse<TransactionResult>>('/send-email', request);
    console.log('[SendEmail] Response:', response.data);
    return response.data.data!;
  }

  async sendSms(request: SendSmsRequest): Promise<TransactionResult> {
    console.log('[SendSms] Payload:', request);
    const response = await this.api.post<ApiResponse<TransactionResult>>('/send-sms', request);
    console.log('[SendSms] Response:', response.data);
    return response.data.data!;
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.api.get('/health');
      return true;
    } catch {
      return false;
    }
  }
}

export const apiService = new ApiService();
export default apiService;
