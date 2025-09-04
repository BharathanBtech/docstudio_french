import React, { useState, useCallback } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { CsvRow, TransactionStatus } from '../types';
import apiService from '../services/api';

interface TransactionManagerProps {
  csvData: CsvRow[];
  emailTemplateId: string;
  smsTemplateId?: string;
  enableSmsFailover: boolean;
  onDataUpdate: (data: CsvRow[]) => void;
}

const TransactionManager: React.FC<TransactionManagerProps> = ({
  csvData,
  emailTemplateId,
  smsTemplateId,
  enableSmsFailover,
  onDataUpdate
}) => {
  const { t } = useLanguage();
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentRow, setCurrentRow] = useState(0);
  const [error, setError] = useState('');

  const updateRowStatus = useCallback((rowId: string, status: TransactionStatus, smsStatus?: TransactionStatus, error?: string) => {
    const updatedData = csvData.map((row: CsvRow) => 
      row.id === rowId 
        ? { 
            ...row, 
            emailStatus: status,
            smsStatus: smsStatus || row.smsStatus,
            error,
            emailSentAt: status === 'success' ? new Date().toISOString() : row.emailSentAt,
            smsSentAt: smsStatus === 'sms_sent' ? new Date().toISOString() : row.smsSentAt
          }
        : row
    );
    onDataUpdate(updatedData);
  }, [csvData, onDataUpdate]);

  const processRow = async (row: CsvRow): Promise<void> => {
    try {
      // Send email first
      const emailResult = await apiService.sendEmail({
        templateId: emailTemplateId,
        recipientEmail: row.data.email || '',
        variables: row.data
      });

      if (emailResult.success) {
        updateRowStatus(row.id, 'success');
      } else if (emailResult.status === 'bounced' && enableSmsFailover && smsTemplateId) {
        // Email bounced, try SMS failover
        try {
          const smsResult = await apiService.sendSms({
            templateId: smsTemplateId,
            recipientPhone: row.data.phone || '',
            variables: row.data
          });

          if (smsResult.success) {
            updateRowStatus(row.id, 'bounced', 'sms_sent');
          } else {
            updateRowStatus(row.id, 'bounced', 'failed', smsResult.message);
          }
        } catch (smsError) {
          updateRowStatus(row.id, 'bounced', 'failed', 'SMS sending failed');
        }
      } else {
        updateRowStatus(row.id, 'failed', undefined, emailResult.message);
      }
    } catch (error) {
      updateRowStatus(row.id, 'failed', undefined, 'Network error');
    }
  };

  const startTransaction = async () => {
    if (!emailTemplateId) {
      setError(t('errors.templateRequired'));
      return;
    }

    setError('');
    setIsRunning(true);
    setProgress(0);
    setCurrentRow(0);

    try {
      for (let i = 0; i < csvData.length; i++) {
        if (!isRunning) break; // Check if stopped

        setCurrentRow(i + 1);
        setProgress(((i + 1) / csvData.length) * 100);

        const row = csvData[i];
        await processRow(row);

        // Add small delay to prevent overwhelming the API
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    } catch (error) {
      setError('Transaction failed: ' + (error as Error).message);
    } finally {
      setIsRunning(false);
      setProgress(100);
    }
  };

  const stopTransaction = () => {
    setIsRunning(false);
  };

  const getStatusSummary = () => {
    const total = csvData.length;
    const success = csvData.filter(row => row.emailStatus === 'success').length;
    const failed = csvData.filter(row => row.emailStatus === 'failed').length;
    const bounced = csvData.filter(row => row.emailStatus === 'bounced').length;
    const smsSent = csvData.filter(row => row.smsStatus === 'sms_sent').length;
    const pending = csvData.filter(row => row.emailStatus === 'pending').length;

    return { total, success, failed, bounced, smsSent, pending };
  };

  const statusSummary = getStatusSummary();

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Transaction Manager</h3>
      </div>
      
      <div className="card-body">
        <div style={{ display: 'grid', gap: 'var(--spacing-6)' }}>
          
          {/* Transaction Controls */}
          <div style={{ display: 'flex', gap: 'var(--spacing-4)', alignItems: 'center' }}>
            {!isRunning ? (
              <button
                onClick={startTransaction}
                className="btn btn-primary btn-lg"
                disabled={!emailTemplateId}
              >
                {t('dashboard.startTransaction')}
              </button>
            ) : (
              <button
                onClick={stopTransaction}
                className="btn btn-error btn-lg"
              >
                {t('dashboard.stopTransaction')}
              </button>
            )}

            {isRunning && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)' }}>
                <div className="spinner"></div>
                <span style={{ color: 'var(--gray-600)' }}>
                  {t('dashboard.transactionInProgress')}
                </span>
              </div>
            )}
          </div>

          {/* Progress Bar */}
          {isRunning && (
            <div>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: 'var(--spacing-2)'
              }}>
                <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)' }}>
                  Progress: {Math.round(progress)}%
                </span>
                <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)' }}>
                  Row {currentRow} of {csvData.length}
                </span>
              </div>
              <div style={{
                width: '100%',
                height: '8px',
                backgroundColor: 'var(--gray-200)',
                borderRadius: 'var(--radius-full)',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${progress}%`,
                  height: '100%',
                  backgroundColor: 'var(--primary-color)',
                  transition: 'width 0.3s ease'
                }} />
              </div>
            </div>
          )}

          {/* Status Summary */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
            gap: 'var(--spacing-4)',
            padding: 'var(--spacing-4)',
            backgroundColor: 'var(--gray-50)',
            borderRadius: 'var(--radius-md)'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'bold', color: 'var(--gray-900)' }}>
                {statusSummary.total}
              </div>
              <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)' }}>Total</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'bold', color: 'var(--success-color)' }}>
                {statusSummary.success}
              </div>
              <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)' }}>Success</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'bold', color: 'var(--error-color)' }}>
                {statusSummary.failed}
              </div>
              <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)' }}>Failed</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'bold', color: 'var(--warning-color)' }}>
                {statusSummary.bounced}
              </div>
              <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)' }}>Bounced</div>
            </div>
            {enableSmsFailover && (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'bold', color: 'var(--info-color)' }}>
                  {statusSummary.smsSent}
                </div>
                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)' }}>SMS Sent</div>
              </div>
            )}
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'bold', color: 'var(--gray-500)' }}>
                {statusSummary.pending}
              </div>
              <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)' }}>Pending</div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="alert alert-error">
              {error}
            </div>
          )}

          {/* Transaction Info */}
          <div style={{
            padding: 'var(--spacing-4)',
            backgroundColor: 'var(--blue-50)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--blue-200)'
          }}>
            <h4 style={{ margin: '0 0 var(--spacing-3) 0', color: 'var(--blue-800)' }}>
              Transaction Configuration
            </h4>
            <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--blue-700)' }}>
              <div><strong>Email Template:</strong> {emailTemplateId}</div>
              <div><strong>SMS Failover:</strong> {enableSmsFailover ? 'Enabled' : 'Disabled'}</div>
              {enableSmsFailover && smsTemplateId && (
                <div><strong>SMS Template:</strong> {smsTemplateId}</div>
              )}
              <div><strong>Total Rows:</strong> {csvData.length}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionManager;
