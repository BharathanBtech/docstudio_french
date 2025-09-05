import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { config } from '../utils/config';
import {
  EmailTemplate,
  SmsTemplate,
  SendEmailRequest,
  SendSmsRequest,
  ApiResponse,
  TransactionResult,
  Campaign,
  CreateCampaignRequest
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
          //alert(JSON.stringify(out));

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
    try {
      // Use the Activepieces webhook URL for SMS templates
      const webhookUrl = 'https://pds-workflow.tekclansolutions.com/api/v1/webhooks/TJBidUQw8WrLnwwkx5e12/sync';
      console.log('[SmsTemplates] Fetching via Activepieces webhook:', webhookUrl);
      
      const response = await axios.get(webhookUrl, {
        headers: { 'Content-Type': 'application/json' }
      });
      
      console.log('[SmsTemplates] Raw response:', response.status, response.data);
      
      // The webhook returns an array of SMS templates with different structure
      if (Array.isArray(response.data)) {
        // Map the response to match your frontend's expected SmsTemplate interface
        const mappedTemplates: SmsTemplate[] = response.data.map((template: any) => ({
          id: String(template.templateId || template.id), // Use templateId as id
          name: template.name || 'Unnamed Template',
          content: `SMS Template: ${template.name}` // Generate content since it's not in the response
        }));
        
        console.log('[SmsTemplates] Mapped templates:', mappedTemplates);
        return mappedTemplates;
      } else if (response.data && Array.isArray(response.data.data)) {
        // If wrapped in .data property
        const mappedTemplates: SmsTemplate[] = response.data.data.map((template: any) => ({
          id: String(template.templateId || template.id),
          name: template.name || 'Unnamed Template',
          content: `SMS Template: ${template.name}`
        }));
        
        console.log('[SmsTemplates] Mapped templates from .data:', mappedTemplates);
        return mappedTemplates;
      } else {
        console.warn('[SmsTemplates] Unexpected response structure:', response.data);
        return [];
      }
    } catch (error) {
      console.error('[SmsTemplates] Error fetching SMS templates:', error);
      return [];
    }
  }

  // Campaign Management - Using Activepieces webhook
  async getCampaigns(): Promise<Campaign[]> {
    try {
      // Use the Activepieces webhook URL directly
      const webhookUrl = 'https://pds-workflow.tekclansolutions.com/api/v1/webhooks/9j0PyU8fXpT0fSQeyy0fM/sync';
      console.log('[Campaigns] Fetching via Activepieces webhook:', webhookUrl);
      
      const response = await axios.get(webhookUrl, {
        headers: { 'Content-Type': 'application/json' }
      });
      
      console.log('[Campaigns] Raw response:', response.status, response.data);
      
      // Debug the raw data structure
      if (Array.isArray(response.data) && response.data.length > 0) {
        console.log('[Campaigns] Raw campaign data sample:', {
          sendimmediately: response.data[0].sendimmediately,
          scheduledat: response.data[0].scheduledat,
          send_immediately: response.data[0].send_immediately,
          scheduled_at: response.data[0].scheduled_at
        });
      }
      
      // The webhook returns the campaigns array directly
      if (Array.isArray(response.data)) {
        // Map snake_case response to camelCase for frontend
        const mappedCampaigns: Campaign[] = response.data.map((campaign: any) => ({
          id: campaign.id,
          name: campaign.name,
          description: campaign.description,
          emailTemplateId: campaign.email_template_id,
          emailTemplateName: campaign.email_template_name,
          smsTemplateId: campaign.sms_template_id,
          smsTemplateName: campaign.sms_template_name,
          enableSmsFailover: campaign.enable_sms_failover,
          csvData: campaign.csvData || [],
          status: campaign.status,
          createdAt: campaign.created_at,
          updatedAt: campaign.updated_at,
          createdBy: campaign.created_by,
          totalRecords: campaign.total_records,
          successCount: campaign.success_count,
          failedCount: campaign.failed_count,
          bouncedCount: campaign.bounced_count,
          smsSentCount: campaign.sms_sent_count,
          sendImmediately: campaign.sendimmediately !== false, // Use correct field name from API
          scheduledAt: campaign.sendimmediately !== false 
            ? new Date().toISOString() // If immediate, use current date/time
            : campaign.scheduledat, // Otherwise use the scheduled date from API
          timezone: campaign.timezone
        }));
        
        console.log('[Campaigns] Mapped campaigns:', mappedCampaigns);
        
        // Debug the scheduling logic
        mappedCampaigns.forEach(campaign => {
          console.log(`[Campaigns] ${campaign.name} scheduling:`, {
            sendImmediately: campaign.sendImmediately,
            scheduledAt: campaign.scheduledAt,
            originalSendimmediately: campaign.sendImmediately ? 'true (immediate)' : 'false (scheduled)'
          });
        });
        return mappedCampaigns;
      } else {
        console.warn('[Campaigns] Unexpected response structure:', response.data);
        return [];
      }
    } catch (error) {
      console.error('[Campaigns] Error fetching campaigns:', error);
      throw error;
    }
  }

  async getCampaign(id: string): Promise<Campaign> {
    try {
      // Use the Activepieces webhook URL for individual campaigns
      const webhookUrl = `https://pds-workflow.tekclansolutions.com/api/v1/webhooks/YknmLvtJSEFRZmrUdVeTy/sync?id=${id}`;
      console.log('[Campaign] Fetching via Activepieces webhook:', webhookUrl);
      
      const response = await axios.get(webhookUrl, {
        headers: { 'Content-Type': 'application/json' }
      });
      
      console.log('[Campaign] Raw response:', response.status, response.data);
      
      // The webhook returns an array with one campaign
      if (Array.isArray(response.data) && response.data.length > 0) {
        const rawCampaign = response.data[0];
        
        // Map snake_case response to camelCase for frontend
        const campaign: Campaign = {
          id: rawCampaign.id,
          name: rawCampaign.name,
          description: rawCampaign.description,
          emailTemplateId: rawCampaign.email_template_id,
          emailTemplateName: rawCampaign.email_template_name,
          smsTemplateId: rawCampaign.sms_template_id,
          smsTemplateName: rawCampaign.sms_template_name,
          enableSmsFailover: rawCampaign.enable_sms_failover,
          csvData: rawCampaign.csvData || [],
          status: rawCampaign.status,
          createdAt: rawCampaign.created_at,
          updatedAt: rawCampaign.updated_at,
          createdBy: rawCampaign.created_by,
          totalRecords: rawCampaign.total_records,
          successCount: rawCampaign.success_count,
          failedCount: rawCampaign.failed_count,
          bouncedCount: rawCampaign.bounced_count,
          smsSentCount: rawCampaign.sms_sent_count,
          sendImmediately: rawCampaign.send_immediately !== false, // Default to true if not specified
          scheduledAt: rawCampaign.scheduled_at,
          timezone: rawCampaign.timezone
        };
        
        console.log('[Campaign] Mapped campaign:', campaign);
        return campaign;
      } else {
        console.warn('[Campaign] No campaign found with ID:', id);
        throw new Error('Campaign not found');
      }
    } catch (error) {
      console.error('[Campaign] Error fetching campaign:', error);
      throw error;
    }
  }

  async createCampaign(request: CreateCampaignRequest): Promise<Campaign> {
    try {
      // Use the Activepieces webhook URL for creating campaigns
      const webhookUrl = 'https://pds-workflow.tekclansolutions.com/api/v1/webhooks/4ntMH0s7a8rZ0UGRpBWvX/sync';
      console.log('[CreateCampaign] Creating campaign via Activepieces webhook:', webhookUrl);
      console.log('[CreateCampaign] Request payload:', request);
      
      const response = await axios.post(webhookUrl, request, {
        headers: { 'Content-Type': 'application/json' }
      });
      
      console.log('[CreateCampaign] Response:', response.status, response.data);
      
      // Check if the campaign was created successfully
      if (response.data && response.data.success === "true") {
        console.log('[CreateCampaign] Campaign created successfully');
        // Since we only get success status, we'll return a mock campaign object
        // or you can implement a way to get the created campaign details
        return {
          id: `campaign-${Date.now()}`, // Generate a temporary ID
          name: request.name,
          description: request.description,
          emailTemplateId: request.emailTemplateId,
          emailTemplateName: request.emailTemplateName,
          smsTemplateId: request.smsTemplateId,
          smsTemplateName: request.smsTemplateName,
          enableSmsFailover: request.enableSmsFailover,
          csvData: request.csvData,
          status: request.sendImmediately ? 'draft' : 'scheduled',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: request.createdBy,
          totalRecords: request.csvData.length,
          successCount: 0,
          failedCount: 0,
          bouncedCount: 0,
          smsSentCount: 0,
          sendImmediately: request.sendImmediately,
          scheduledAt: request.scheduledAt,
          timezone: request.timezone
        };
      } else {
        throw new Error('Failed to create campaign');
      }
    } catch (error) {
      console.error('[CreateCampaign] Error creating campaign:', error);
      throw error;
    }
  }

  async updateCampaign(_id: string, _request: Partial<CreateCampaignRequest>): Promise<Campaign> {
    // TODO: Implement update campaign endpoint in Activepieces
    throw new Error('Update campaign not yet implemented');
  }

  async deleteCampaign(_id: string): Promise<void> {
    // TODO: Implement delete campaign endpoint in Activepieces
    throw new Error('Delete campaign not yet implemented');
  }

  async startCampaign(_id: string): Promise<void> {
    // TODO: Implement start campaign endpoint in Activepieces
    throw new Error('Start campaign not yet implemented');
  }

  async pauseCampaign(_id: string): Promise<void> {
    // TODO: Implement pause campaign endpoint in Activepieces
    throw new Error('Pause campaign not yet implemented');
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
