import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { EmailTemplate, SmsTemplate } from '../types';

interface TemplateSelectionSectionProps {
  emailTemplates: EmailTemplate[];
  smsTemplates: SmsTemplate[];
  selectedEmailTemplate: string;
  selectedSmsTemplate: string;
  enableSmsFailover: boolean;
  onEmailTemplateChange: (templateId: string) => void;
  onSmsTemplateChange: (templateId: string) => void;
  onSmsFailoverChange: (enabled: boolean) => void;
  loading: boolean;
}

const TemplateSelectionSection: React.FC<TemplateSelectionSectionProps> = ({
  emailTemplates,
  smsTemplates,
  selectedEmailTemplate,
  selectedSmsTemplate,
  enableSmsFailover,
  onEmailTemplateChange,
  onSmsTemplateChange,
  onSmsFailoverChange,
  loading
}) => {
  const { t } = useLanguage();

  if (loading) {
    return (
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">{t('dashboard.templateSelection')}</h3>
        </div>
        <div className="card-body" style={{ textAlign: 'center', padding: 'var(--spacing-12)' }}>
          <div className="spinner"></div>
          <p style={{ marginTop: 'var(--spacing-4)', color: 'var(--gray-500)' }}>
            {t('common.loading')} {t('dashboard.templateSelection').toLowerCase()}...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">{t('dashboard.templateSelection')}</h3>
      </div>
      
      <div className="card-body">
        <div style={{ display: 'grid', gap: 'var(--spacing-6)' }}>
          
          {/* Email Template Selection */}
          <div className="form-group">
            <label htmlFor="emailTemplate" className="form-label">
              {t('dashboard.emailTemplate')} *
            </label>
            <select
              id="emailTemplate"
              className="form-input"
              value={selectedEmailTemplate}
              onChange={(e) => onEmailTemplateChange(e.target.value)}
              required
            >
              <option value="">{t('dashboard.selectEmailTemplate')}</option>
              {emailTemplates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>
            {selectedEmailTemplate && (
              <div style={{ 
                marginTop: 'var(--spacing-3)', 
                padding: 'var(--spacing-3)', 
                backgroundColor: 'var(--gray-50)', 
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--font-size-sm)'
              }}>
                <strong>Subject:</strong> {emailTemplates.find(t => t.id === selectedEmailTemplate)?.subject}<br />
                <strong>Content Preview:</strong> {emailTemplates.find(t => t.id === selectedEmailTemplate)?.content.substring(0, 100)}...
              </div>
            )}
          </div>

          {/* SMS Failover Checkbox */}
          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={enableSmsFailover}
                onChange={(e) => onSmsFailoverChange(e.target.checked)}
                style={{ width: 'auto' }}
              />
              <span className="form-label" style={{ margin: 0 }}>
                {t('dashboard.failoverSms')}
              </span>
            </label>
            <div className="form-help">
              If checked, SMS will be sent automatically when email delivery fails
            </div>
          </div>

          {/* SMS Template Selection (conditional) */}
          {enableSmsFailover && (
            <div className="form-group">
              <label htmlFor="smsTemplate" className="form-label">
                {t('dashboard.smsTemplate')} *
              </label>
              <select
                id="smsTemplate"
                className="form-input"
                value={selectedSmsTemplate}
                onChange={(e) => onSmsTemplateChange(e.target.value)}
                required={enableSmsFailover}
              >
                <option value="">{t('dashboard.selectSmsTemplate')}</option>
                {smsTemplates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </select>
              {selectedSmsTemplate && (
                <div style={{ 
                  marginTop: 'var(--spacing-3)', 
                  padding: 'var(--spacing-3)', 
                  backgroundColor: 'var(--gray-50)', 
                  borderRadius: 'var(--radius-md)',
                  fontSize: 'var(--font-size-sm)'
                }}>
                  <strong>Content Preview:</strong> {smsTemplates.find(t => t.id === selectedSmsTemplate)?.content.substring(0, 100)}...
                </div>
              )}
            </div>
          )}

          {/* Template Status */}
          <div style={{ 
            padding: 'var(--spacing-4)', 
            backgroundColor: 'var(--gray-50)', 
            borderRadius: 'var(--radius-md)',
            fontSize: 'var(--font-size-sm)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--gray-600)' }}>
                <strong>Available Templates:</strong>
              </span>
              <span style={{ color: 'var(--gray-500)' }}>
                Email: {emailTemplates.length} | SMS: {smsTemplates.length}
              </span>
            </div>
            
            {emailTemplates.length === 0 && (
              <div className="alert alert-warning" style={{ marginTop: 'var(--spacing-3)', marginBottom: 0 }}>
                No email templates available. Please contact your administrator.
              </div>
            )}
            
            {enableSmsFailover && smsTemplates.length === 0 && (
              <div className="alert alert-warning" style={{ marginTop: 'var(--spacing-3)', marginBottom: 0 }}>
                No SMS templates available. Email failover will not work.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateSelectionSection;
