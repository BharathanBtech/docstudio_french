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

    // Add response interceptor for error handling
    this.api.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error) => {
        console.error('API Error:', error);
        throw new Error(error.response?.data?.message || error.message || 'Network error');
      }
    );
  }

  // Email Templates
  async getEmailTemplates(): Promise<EmailTemplate[]> {
    const response = await this.api.get<ApiResponse<EmailTemplate[]>>('/email-templates');
    return response.data.data || [];
  }

  // SMS Templates
  async getSmsTemplates(): Promise<SmsTemplate[]> {
    const response = await this.api.get<ApiResponse<SmsTemplate[]>>('/sms-templates');
    return response.data.data || [];
  }

  // Send Email
  async sendEmail(request: SendEmailRequest): Promise<TransactionResult> {
    const response = await this.api.post<ApiResponse<TransactionResult>>('/send-email', request);
    return response.data.data!;
  }

  // Send SMS
  async sendSms(request: SendSmsRequest): Promise<TransactionResult> {
    const response = await this.api.post<ApiResponse<TransactionResult>>('/send-sms', request);
    return response.data.data!;
  }

  // Health check
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
