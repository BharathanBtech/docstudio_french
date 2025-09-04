export interface User {
  id: string;
  email: string;
  name: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
}

export interface SmsTemplate {
  id: string;
  name: string;
  content: string;
}

export interface CsvRow {
  id: string;
  data: Record<string, string>;
  emailStatus: TransactionStatus;
  smsStatus?: TransactionStatus;
  emailSentAt?: string;
  smsSentAt?: string;
  error?: string;
}

export type TransactionStatus = 'pending' | 'success' | 'failed' | 'bounced' | 'sms_sent';

export interface TransactionResult {
  rowId: string;
  success: boolean;
  status: TransactionStatus;
  message: string;
  timestamp: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface SendEmailRequest {
  templateId: string;
  recipientEmail: string;
  variables: Record<string, string>;
}

export interface SendSmsRequest {
  templateId: string;
  recipientPhone: string;
  variables: Record<string, string>;
}

export interface AppConfig {
  language: string;
  apiBaseUrl: string;
  apiKey: string;
  emailTemplatesUrl?: string;
}
