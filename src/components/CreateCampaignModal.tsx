import React, { useState, useEffect } from 'react';
import { EmailTemplate, SmsTemplate, CreateCampaignRequest, CsvRow } from '../types';
import apiService from '../services/api';
import { parseCsvFile, validateCsvData } from '../utils/csvParser';
import { useLanguage } from '../contexts/LanguageContext';

interface CreateCampaignModalProps {
  onClose: () => void;
  onSubmit: (campaignData: CreateCampaignRequest) => void;
}

const CreateCampaignModal: React.FC<CreateCampaignModalProps> = ({ onClose, onSubmit }) => {
  console.log('[CreateCampaignModal] Component rendering');
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    emailTemplateId: '',
    smsTemplateId: '',
    enableSmsFailover: false,
    sendImmediately: true,
    scheduledAt: '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  });
  
  const [csvData, setCsvData] = useState<CsvRow[]>([]);
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>([]);
  const [smsTemplates, setSmsTemplates] = useState<SmsTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [templatesLoading, setTemplatesLoading] = useState(true);
  const [error, setError] = useState('');

  const { t } = useLanguage();

  useEffect(() => {
    console.log('[CreateCampaignModal] useEffect triggered - component mounted');
    console.log('[CreateCampaignModal] About to call loadTemplates()');
    loadTemplates();
    console.log('[CreateCampaignModal] loadTemplates() called');
  }, []);

  const loadTemplates = async () => {
    console.log('[CreateCampaignModal] loadTemplates function entered');
    try {
      setTemplatesLoading(true);
      console.log('[CreateCampaignModal] Starting to load templates...');
      
      // Load email templates individually to see which one fails
      console.log('[CreateCampaignModal] About to call apiService.getEmailTemplates()');
      let emailTemplatesData: EmailTemplate[] = [];
      try {
        emailTemplatesData = await apiService.getEmailTemplates();
        console.log('[CreateCampaignModal] Email templates loaded successfully:', emailTemplatesData);
      } catch (emailError) {
        console.error('[CreateCampaignModal] Failed to load email templates:', emailError);
        emailTemplatesData = [];
      }
      
      // Load SMS templates individually
      console.log('[CreateCampaignModal] About to call apiService.getSmsTemplates()');
      let smsTemplatesData: SmsTemplate[] = [];
      try {
        smsTemplatesData = await apiService.getSmsTemplates();
        console.log('[CreateCampaignModal] SMS templates loaded successfully:', smsTemplatesData);
      } catch (smsError) {
        console.error('[CreateCampaignModal] Failed to load SMS templates:', smsError);
        smsTemplatesData = [];
      }
      
      console.log('[CreateCampaignModal] API calls completed');
      console.log('[CreateCampaignModal] Email templates response:', emailTemplatesData);
      console.log('[CreateCampaignModal] Email templates length:', emailTemplatesData?.length || 0);
      console.log('[CreateCampaignModal] SMS templates response:', smsTemplatesData);
      console.log('[CreateCampaignModal] SMS templates length:', smsTemplatesData?.length || 0);
      
      setEmailTemplates(emailTemplatesData);
      setSmsTemplates(smsTemplatesData);
      
      if (emailTemplatesData && emailTemplatesData.length > 0) {
        console.log('[CreateCampaignModal] Setting default email template ID:', emailTemplatesData[0].id);
        setFormData(prev => ({ ...prev, emailTemplateId: emailTemplatesData[0].id }));
      } else {
        console.log('[CreateCampaignModal] No email templates found or empty array');
      }
      
      if (smsTemplatesData && smsTemplatesData.length > 0) {
        console.log('[CreateCampaignModal] Setting default SMS template ID:', smsTemplatesData[0].id);
        setFormData(prev => ({ ...prev, smsTemplateId: smsTemplatesData[0].id }));
      } else {
        console.log('[CreateCampaignModal] No SMS templates found or empty array');
      }
      
    } catch (error) {
      console.error('[CreateCampaignModal] Unexpected error in loadTemplates:', error);
      setError('Failed to load templates');
    } finally {
      setTemplatesLoading(false);
      console.log('[CreateCampaignModal] Templates loading completed');
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCsvUpload = async (file: File) => {
    try {
      setError('');
      const result = await parseCsvFile(file);
      
      if (!result.success) {
        setError(result.error || 'Failed to parse CSV file');
        return;
      }

      const validation = validateCsvData(result.data);
      if (!validation.valid) {
        setError(validation.errors.join(', '));
        return;
      }

      setCsvData(result.data);
    } catch (err) {
      setError('Error processing CSV file');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError('Campaign name is required');
      return;
    }
    
    if (!formData.emailTemplateId) {
      setError('Email template is required');
      return;
    }
    
    if (csvData.length === 0) {
      setError('CSV data is required');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const campaignData: CreateCampaignRequest = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        emailTemplateId: formData.emailTemplateId,
        emailTemplateName: getEmailTemplateName(formData.emailTemplateId),
        smsTemplateId: formData.enableSmsFailover ? formData.smsTemplateId : undefined,
        smsTemplateName: formData.enableSmsFailover ? getSmsTemplateName(formData.smsTemplateId) : undefined,
        enableSmsFailover: formData.enableSmsFailover,
        createdBy: 'admin@docstudio.com', // You can make this dynamic based on logged-in user
        csvData,
        sendImmediately: formData.sendImmediately,
        scheduledAt: formData.sendImmediately ? undefined : formData.scheduledAt,
        timezone: formData.sendImmediately ? undefined : formData.timezone
      };
      
      onSubmit(campaignData);
    } catch (err) {
      setError('Failed to create campaign');
    } finally {
      setLoading(false);
    }
  };

  const getEmailTemplateName = (id: string) => {
    return emailTemplates.find(t => t.id === id)?.name || '';
  };

  const getSmsTemplateName = (id: string) => {
    return smsTemplates.find(t => t.id === id)?.name || '';
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{t('campaigns.modalTitle')}</h3>
          <button
            type="button"
            className="modal-close"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>
        
        <div className="modal-body">
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gap: 'var(--spacing-6)' }}>
              
              {/* Campaign Details */}
              <div>
                <h4 style={{ marginBottom: 'var(--spacing-4)', color: 'var(--gray-700)' }}>
                  {t('campaigns.campaignInformation')}
                </h4>
                <div style={{ display: 'grid', gap: 'var(--spacing-4)' }}>
                  <div className="form-group">
                    <label htmlFor="campaignName" className="form-label">
                      {t('campaigns.campaignName')} *
                    </label>
                    <input
                      type="text"
                      id="campaignName"
                      className="form-input"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder={t('campaigns.campaignNamePlaceholder')}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="campaignDescription" className="form-label">
                      {t('campaigns.description')}
                    </label>
                    <textarea
                      id="campaignDescription"
                      className="form-input"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder={t('campaigns.descriptionPlaceholder')}
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              {/* Template Selection */}
              <div>
                <h4 style={{ marginBottom: 'var(--spacing-4)', color: 'var(--gray-700)' }}>
                  {t('campaigns.templateConfiguration')}
                </h4>
                <div style={{ display: 'grid', gap: 'var(--spacing-4)' }}>
                  
                  {templatesLoading ? (
                    <div style={{ textAlign: 'center', padding: 'var(--spacing-8)' }}>
                      <div className="spinner"></div>
                      <p style={{ marginTop: 'var(--spacing-4)', color: 'var(--gray-500)' }}>
                        {t('campaigns.loadingTemplates')}
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="form-group">
                        <label htmlFor="emailTemplate" className="form-label">
                          {t('campaigns.emailTemplate')} *
                        </label>
                        <select
                          id="emailTemplate"
                          className="form-input"
                          value={formData.emailTemplateId}
                          onChange={(e) => handleInputChange('emailTemplateId', e.target.value)}
                          required
                        >
                          <option value="">{t('campaigns.selectEmailTemplate')}</option>
                          {emailTemplates.map((template) => (
                            <option key={template.id} value={template.id}>
                              {template.name}
                            </option>
                          ))}
                        </select>
                        {formData.emailTemplateId && (
                          <div className="form-help">
                            {t('campaigns.selectedEmailTemplate', { name: getEmailTemplateName(formData.emailTemplateId) })}
                          </div>
                        )}
                      </div>

                      <div className="form-group">
                        <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)', cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={formData.enableSmsFailover}
                            onChange={(e) => handleInputChange('enableSmsFailover', e.target.checked)}
                            style={{ width: 'auto' }}
                          />
                          <span className="form-label" style={{ margin: 0 }}>
                            {t('campaigns.enableSmsFailover')}
                          </span>
                        </label>
                        <div className="form-help">
                          {t('campaigns.enableSmsFailoverHelp')}
                        </div>
                      </div>

                      {formData.enableSmsFailover && (
                        <div className="form-group">
                          <label htmlFor="smsTemplate" className="form-label">
                            {t('campaigns.smsTemplate')} *
                          </label>
                          <select
                            id="smsTemplate"
                            className="form-input"
                            value={formData.smsTemplateId}
                            onChange={(e) => handleInputChange('smsTemplateId', e.target.value)}
                            required={formData.enableSmsFailover}
                          >
                            <option value="">{t('campaigns.selectSmsTemplate')}</option>
                            {smsTemplates.map((template) => (
                              <option key={template.id} value={template.id}>
                                {template.name}
                              </option>
                            ))}
                          </select>
                          {formData.smsTemplateId && (
                            <div className="form-help">
                              {t('campaigns.selectedSmsTemplate', { name: getSmsTemplateName(formData.smsTemplateId) })}
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* CSV Upload */}
              <div>
                <h4 style={{ marginBottom: 'var(--spacing-4)', color: 'var(--gray-700)' }}>
                  {t('campaigns.dataUpload')}
                </h4>
                
                {csvData.length === 0 ? (
                  <div className="file-upload">
                    <input
                      type="file"
                      accept=".csv"
                      onChange={(e) => e.target.files?.[0] && handleCsvUpload(e.target.files[0])}
                    />
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--spacing-4)' }}>
                      <div style={{ fontSize: 'var(--font-size-4xl)', color: 'var(--gray-400)' }}>
                        📁
                      </div>
                      <h4 style={{ margin: 0, color: 'var(--gray-700)' }}>
                        {t('campaigns.uploadCsvFile')}
                      </h4>
                      <p style={{ margin: 0, color: 'var(--gray-500)' }}>
                        {t('campaigns.dragAndDropOrClickToBrowse')}
                      </p>
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => {
                          const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
                          fileInput?.click();
                        }}
                      >
                        {t('campaigns.selectFile')}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      marginBottom: 'var(--spacing-4)'
                    }}>
                      <div>
                        <h4 style={{ margin: 0, color: 'var(--gray-700)' }}>
                          {t('campaigns.csvDataLoaded')}
                        </h4>
                        <p style={{ margin: 'var(--spacing-2) 0 0 0', color: 'var(--gray-500)' }}>
                          {t('campaigns.recordsReadyForProcessing', { count: csvData.length })}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setCsvData([])}
                        className="btn btn-secondary btn-sm"
                      >
                        {t('campaigns.changeFile')}
                      </button>
                    </div>
                    
                    {/* Data Preview */}
                    <div style={{ 
                      maxHeight: '200px', 
                      overflow: 'auto', 
                      border: '1px solid var(--gray-200)',
                      borderRadius: 'var(--radius-md)'
                    }}>
                      <table className="table">
                        <thead>
                          <tr>
                            {Object.keys(csvData[0]?.data || {}).map((header) => (
                              <th key={header}>{header}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {csvData.slice(0, 3).map((row) => (
                            <tr key={row.id}>
                              {Object.values(row.data).map((value, colIndex) => (
                                <td key={colIndex}>{value}</td>
                              ))}
                            </tr>
                          ))}
                          {csvData.length > 3 && (
                            <tr>
                              <td colSpan={Object.keys(csvData[0]?.data || {}).length} style={{ textAlign: 'center', color: 'var(--gray-500)' }}>
                                {t('campaigns.andMoreRows', { count: csvData.length - 3 })}
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>

              {/* Campaign Scheduling */}
              <div>
                <h4 style={{ marginBottom: 'var(--spacing-4)', color: 'var(--gray-700)' }}>
                  {t('campaigns.campaignScheduling')}
                </h4>
                <div style={{ display: 'grid', gap: 'var(--spacing-4)' }}>
                  
                  <div className="form-group">
                    <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)', cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name="sendOption"
                        checked={formData.sendImmediately}
                        onChange={() => setFormData(prev => ({ ...prev, sendImmediately: true }))}
                        style={{ width: 'auto' }}
                      />
                      <span className="form-label" style={{ margin: 0 }}>
                        {t('campaigns.sendImmediately')}
                      </span>
                    </label>
                    <div className="form-help">
                      {t('campaigns.sendImmediatelyHelp')}
                    </div>
                  </div>

                  <div className="form-group">
                    <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)', cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name="sendOption"
                        checked={!formData.sendImmediately}
                        onChange={() => setFormData(prev => ({ ...prev, sendImmediately: false }))}
                        style={{ width: 'auto' }}
                      />
                      <span className="form-label" style={{ margin: 0 }}>
                        {t('campaigns.scheduleForLater')}
                      </span>
                    </label>
                    <div className="form-help">
                      {t('campaigns.scheduleForLaterHelp')}
                    </div>
                  </div>

                  {!formData.sendImmediately && (
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: '1fr 1fr',
                      gap: 'var(--spacing-4)',
                      padding: 'var(--spacing-4)',
                      backgroundColor: 'var(--gray-50)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--gray-200)'
                    }}>
                      <div className="form-group">
                        <label htmlFor="scheduledDate" className="form-label">
                          {t('campaigns.date')} *
                        </label>
                        <input
                          type="date"
                          id="scheduledDate"
                          className="form-input"
                          value={formData.scheduledAt.split('T')[0] || ''}
                          onChange={(e) => {
                            const date = e.target.value;
                            const time = formData.scheduledAt.split('T')[1] || '12:00';
                            setFormData(prev => ({ 
                              ...prev, 
                              scheduledAt: `${date}T${time}` 
                            }));
                          }}
                          min={new Date().toISOString().split('T')[0]}
                          required={!formData.sendImmediately}
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="scheduledTime" className="form-label">
                          {t('campaigns.time')} *
                        </label>
                        <input
                          type="time"
                          id="scheduledTime"
                          className="form-input"
                          value={formData.scheduledAt.split('T')[1] || '12:00'}
                          onChange={(e) => {
                            const date = formData.scheduledAt.split('T')[0] || new Date().toISOString().split('T')[0];
                            const time = e.target.value;
                            setFormData(prev => ({ 
                              ...prev, 
                              scheduledAt: `${date}T${time}` 
                            }));
                          }}
                          required={!formData.sendImmediately}
                        />
                      </div>

                      <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                        <label htmlFor="timezone" className="form-label">
                          {t('campaigns.timezone')}
                        </label>
                        <select
                          id="timezone"
                          className="form-input"
                          value={formData.timezone}
                          onChange={(e) => setFormData(prev => ({ ...prev, timezone: e.target.value }))}
                        >
                          <option value="UTC">{t('campaigns.utc')}</option>
                          <option value="America/New_York">{t('campaigns.easternTime')}</option>
                          <option value="America/Chicago">{t('campaigns.centralTime')}</option>
                          <option value="America/Denver">{t('campaigns.mountainTime')}</option>
                          <option value="America/Los_Angeles">{t('campaigns.pacificTime')}</option>
                          <option value="Europe/London">{t('campaigns.london')}</option>
                          <option value="Europe/Paris">{t('campaigns.paris')}</option>
                          <option value="Asia/Tokyo">{t('campaigns.tokyo')}</option>
                          <option value="Asia/Shanghai">{t('campaigns.shanghai')}</option>
                          <option value="Asia/Kolkata">{t('campaigns.india')}</option>
                        </select>
                        <div className="form-help">
                          {t('campaigns.timezoneHelp')}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="alert alert-error">
                {error}
              </div>
            )}
          </form>
        </div>
        
        <div className="modal-footer">
          <button 
            type="button" 
            className="btn btn-secondary" 
            onClick={onClose}
            disabled={loading}
          >
            {t('campaigns.cancel')}
          </button>
          <button 
            type="submit" 
            className="btn btn-primary" 
            onClick={handleSubmit}
            disabled={loading || !formData.name.trim() || !formData.emailTemplateId || csvData.length === 0}
          >
            {loading ? (
              <>
                <div className="spinner"></div>
                {t('campaigns.creating')}
              </>
            ) : (
              t('campaigns.createCampaign')
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateCampaignModal;
