import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import CsvUploadSection from '../components/CsvUploadSection';
import TemplateSelectionSection from '../components/TemplateSelectionSection';
import StatusViewer from '../components/StatusViewer';
import TransactionManager from '../components/TransactionManager';
import { CsvRow, EmailTemplate, SmsTemplate } from '../types';
import apiService from '../services/api';

const DashboardPage: React.FC = () => {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  
  const [csvData, setCsvData] = useState<CsvRow[]>([]);
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>([]);
  const [smsTemplates, setSmsTemplates] = useState<SmsTemplate[]>([]);
  const [selectedEmailTemplate, setSelectedEmailTemplate] = useState<string>('');
  const [selectedSmsTemplate, setSelectedSmsTemplate] = useState<string>('');
  const [enableSmsFailover, setEnableSmsFailover] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const [emailTemplatesData, smsTemplatesData] = await Promise.all([
        apiService.getEmailTemplates(),
        apiService.getSmsTemplates()
      ]);
      
      setEmailTemplates(emailTemplatesData);
      setSmsTemplates(smsTemplatesData);
      
      if (emailTemplatesData.length > 0) {
        setSelectedEmailTemplate(emailTemplatesData[0].id);
      }
      if (smsTemplatesData.length > 0) {
        setSelectedSmsTemplate(smsTemplatesData[0].id);
      }
    } catch (error) {
      console.error('Error loading templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCsvDataUpdate = (data: CsvRow[]) => {
    setCsvData(data);
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--gray-50)' }}>
      <header style={{
        backgroundColor: 'var(--white)',
        borderBottom: '1px solid var(--gray-200)',
        padding: 'var(--spacing-4) var(--spacing-6)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-4)' }}>
          <h1 style={{ 
            color: 'var(--primary-color)', 
            fontSize: 'var(--font-size-2xl)',
            margin: 0
          }}>
            DocStudio
          </h1>
          <span style={{ color: 'var(--gray-500)', fontSize: 'var(--font-size-lg)' }}>
            {t('dashboard.title')}
          </span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-4)' }}>
          <span style={{ color: 'var(--gray-600)' }}>
            {t('common.welcome')}, {user?.name}
          </span>
          <button
            onClick={handleLogout}
            className="btn btn-secondary"
          >
            {t('auth.logout')}
          </button>
        </div>
      </header>

      <main style={{ padding: 'var(--spacing-6)', maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gap: 'var(--spacing-6)' }}>
          
          <CsvUploadSection
            onDataUpdate={handleCsvDataUpdate}
            csvData={csvData}
          />

          {csvData.length > 0 && (
            <TemplateSelectionSection
              emailTemplates={emailTemplates}
              smsTemplates={smsTemplates}
              selectedEmailTemplate={selectedEmailTemplate}
              selectedSmsTemplate={selectedSmsTemplate}
              enableSmsFailover={enableSmsFailover}
              onEmailTemplateChange={setSelectedEmailTemplate}
              onSmsTemplateChange={setSelectedSmsTemplate}
              onSmsFailoverChange={setEnableSmsFailover}
              loading={loading}
            />
          )}

          {csvData.length > 0 && selectedEmailTemplate && (
            <TransactionManager
              csvData={csvData}
              emailTemplateId={selectedEmailTemplate}
              smsTemplateId={enableSmsFailover ? selectedSmsTemplate : undefined}
              enableSmsFailover={enableSmsFailover}
              onDataUpdate={handleCsvDataUpdate}
            />
          )}

          {csvData.length > 0 && (
            <StatusViewer
              csvData={csvData}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
