import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { CsvRow, TransactionStatus } from '../types';

interface StatusViewerProps {
  csvData: CsvRow[];
}

const StatusViewer: React.FC<StatusViewerProps> = ({ csvData }) => {
  const { t } = useLanguage();
  const [selectedRow, setSelectedRow] = useState<CsvRow | null>(null);
  const [showModal, setShowModal] = useState(false);

  const getStatusBadge = (status: TransactionStatus) => {
    const statusConfig = {
      pending: { class: 'badge-pending', text: t('status.pending') },
      success: { class: 'badge-success', text: t('status.success') },
      failed: { class: 'badge-error', text: t('status.failed') },
      bounced: { class: 'badge-warning', text: t('status.bounced') },
      sms_sent: { class: 'badge-info', text: t('status.smsSent') }
    };

    const config = statusConfig[status] || statusConfig.pending;
    return <span className={`badge ${config.class}`}>{config.text}</span>;
  };

  const getSmsStatusBadge = (row: CsvRow) => {
    if (!row.smsStatus) return null;
    return getStatusBadge(row.smsStatus);
  };

  const handleRowClick = (row: CsvRow) => {
    setSelectedRow(row);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedRow(null);
  };

  const getHeaders = () => {
    if (csvData.length === 0) return [];
    return Object.keys(csvData[0].data);
  };

  const headers = getHeaders();

  return (
    <>
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">{t('dashboard.statusViewer')}</h3>
        </div>
        
        <div className="card-body">
          {csvData.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 'var(--spacing-8)', color: 'var(--gray-500)' }}>
              No data to display
            </div>
          ) : (
            <div style={{ overflow: 'auto' }}>
              <table className="table">
                <thead>
                  <tr>
                    <th style={{ minWidth: '60px' }}>#</th>
                    {headers.map((header) => (
                      <th key={header} style={{ minWidth: '120px' }}>{header}</th>
                    ))}
                    <th style={{ minWidth: '120px' }}>{t('status.emailStatus')}</th>
                    <th style={{ minWidth: '120px' }}>{t('status.smsStatus')}</th>
                    <th style={{ minWidth: '100px' }}>{t('status.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {csvData.map((row, index) => (
                    <tr key={row.id} style={{ cursor: 'pointer' }} onClick={() => handleRowClick(row)}>
                      <td>{index + 1}</td>
                      {headers.map((header) => (
                        <td key={header} style={{ 
                          maxWidth: '200px', 
                          overflow: 'hidden', 
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {row.data[header] || '-'}
                        </td>
                      ))}
                      <td>{getStatusBadge(row.emailStatus)}</td>
                      <td>{getSmsStatusBadge(row) || '-'}</td>
                      <td>
                        <button
                          className="btn btn-sm btn-secondary"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRowClick(row);
                          }}
                        >
                          {t('status.viewDetails')}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Row Details Modal */}
      {showModal && selectedRow && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)' }}>
                                <img 
                  src="/images/new-logo.png" 
                  alt="DocStudio Logo" 
                  style={{
                    height: '40px',
                    width: 'auto',
                    transform: 'rotate(-5deg)',
                    transition: 'transform 0.3s ease'
                  }}
                />
                <h3 className="modal-title">Row Details - {selectedRow.id}</h3>
              </div>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>
            
            <div className="modal-body">
              <div style={{ display: 'grid', gap: 'var(--spacing-6)' }}>
                
                {/* Row Data */}
                <div>
                  <h4 style={{ marginBottom: 'var(--spacing-3)', color: 'var(--gray-700)' }}>
                    {t('status.rowData')}
                  </h4>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: 'var(--spacing-3)'
                  }}>
                    {Object.entries(selectedRow.data).map(([key, value]) => (
                      <div key={key} style={{
                        padding: 'var(--spacing-3)',
                        backgroundColor: 'var(--gray-50)',
                        borderRadius: 'var(--radius-md)'
                      }}>
                        <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-500)', marginBottom: 'var(--spacing-1)' }}>
                          {key}
                        </div>
                        <div style={{ fontWeight: '500', wordBreak: 'break-word' }}>
                          {value || '-'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Status Information */}
                <div>
                  <h4 style={{ marginBottom: 'var(--spacing-3)', color: 'var(--gray-700)' }}>
                    Transaction Status
                  </h4>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: 'var(--spacing-4)'
                  }}>
                    <div style={{
                      padding: 'var(--spacing-4)',
                      backgroundColor: 'var(--gray-50)',
                      borderRadius: 'var(--radius-md)',
                      textAlign: 'center'
                    }}>
                      <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-500)', marginBottom: 'var(--spacing-2)' }}>
                        Email Status
                      </div>
                      <div style={{ marginBottom: 'var(--spacing-2)' }}>
                        {getStatusBadge(selectedRow.emailStatus)}
                      </div>
                      {selectedRow.emailSentAt && (
                        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-500)' }}>
                          Sent: {new Date(selectedRow.emailSentAt).toLocaleString()}
                        </div>
                      )}
                    </div>

                    {selectedRow.smsStatus && (
                      <div style={{
                        padding: 'var(--spacing-4)',
                        backgroundColor: 'var(--gray-50)',
                        borderRadius: 'var(--radius-md)',
                        textAlign: 'center'
                      }}>
                        <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-500)', marginBottom: 'var(--spacing-2)' }}>
                          SMS Status
                        </div>
                        <div style={{ marginBottom: 'var(--spacing-2)' }}>
                          {getStatusBadge(selectedRow.smsStatus)}
                        </div>
                        {selectedRow.smsSentAt && (
                          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-500)' }}>
                            Sent: {new Date(selectedRow.smsSentAt).toLocaleString()}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Error Information */}
                {selectedRow.error && (
                  <div>
                    <h4 style={{ marginBottom: 'var(--spacing-3)', color: 'var(--gray-700)' }}>
                      Error Details
                    </h4>
                    <div className="alert alert-error">
                      {selectedRow.error}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={closeModal}>
                {t('common.close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default StatusViewer;
