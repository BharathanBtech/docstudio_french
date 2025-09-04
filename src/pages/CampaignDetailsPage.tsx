import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Campaign } from '../types';
import apiService from '../services/api';
import StatusViewer from '../components/StatusViewer';

const CampaignDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      loadCampaign(id);
    }
  }, [id]);

  const loadCampaign = async (campaignId: string) => {
    try {
      setLoading(true);
      const campaignData = await apiService.getCampaign(campaignId);
      setCampaign(campaignData);
    } catch (error) {
      console.error('Error loading campaign:', error);
      setError(t('details.loadFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { class: 'badge-pending', text: t('campaigns.draft') },
      active: { class: 'badge-success', text: t('campaigns.active') },
      paused: { class: 'badge-warning', text: t('campaigns.paused') },
      completed: { class: 'badge-info', text: t('campaigns.completed') },
      failed: { class: 'badge-error', text: t('campaigns.failed') },
      scheduled: { class: 'badge-info', text: t('campaigns.scheduledStatus') }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    return <span className={`badge ${config.class}`}>{config.text}</span>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <div className="spinner"></div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <div style={{ textAlign: 'center' }}>
          <h2>{t('details.notFound')}</h2>
          <button 
            onClick={() => navigate('/campaigns')}
            className="btn btn-primary"
          >
            {t('details.backToCampaigns')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--gray-50)' }}>
      {/* Header */}
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
          <img 
            src="/images/new-logo.png" 
            alt="DocStudio Logo" 
            style={{
              height: '80px',
              width: 'auto',
              transform: 'rotate(-5deg)',
              transition: 'transform 0.3s ease'
            }}
          />
          <span style={{ color: 'var(--gray-500)', fontSize: 'var(--font-size-lg)' }}>
            {t('details.title')}
          </span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-4)' }}>
          <span style={{ color: 'var(--gray-600)' }}>
            {t('auth.welcomeUser', { name: user?.name })}
          </span>
          <button
            onClick={handleLogout}
            className="btn btn-secondary"
          >
            {t('auth.logout')}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ padding: 'var(--spacing-6)', maxWidth: '1400px', margin: '0 auto' }}>
        {/* Back Button */}
        <div style={{ marginBottom: 'var(--spacing-6)' }}>
          <button
            onClick={() => navigate('/campaigns')}
            className="btn btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' }}
          >
            ← {t('details.backToCampaigns')}
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="alert alert-error" style={{ marginBottom: 'var(--spacing-6)' }}>
            {error}
          </div>
        )}

        {/* Campaign Overview */}
        <div className="card" style={{ marginBottom: 'var(--spacing-6)' }}>
          <div className="card-header">
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center' 
            }}>
              <h2 className="card-title">{campaign.name}</h2>
              {getStatusBadge(campaign.status)}
            </div>
          </div>
          
          <div className="card-body">
            <div style={{ display: 'grid', gap: 'var(--spacing-6)' }}>
              
              {/* Campaign Information */}
              <div>
                <h4 style={{ marginBottom: 'var(--spacing-3)', color: 'var(--gray-700)' }}>
                  {t('details.campaignInformation')}
                </h4>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                  gap: 'var(--spacing-4)'
                }}>
                  <div>
                    <label style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-500)' }}>
                      {t('details.description')}
                    </label>
                    <div style={{ marginTop: 'var(--spacing-1)' }}>
                      {campaign.description || t('details.noDescription')}
                    </div>
                  </div>
                  
                  <div>
                    <label style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-500)' }}>
                      {t('details.createdBy')}
                    </label>
                    <div style={{ marginTop: 'var(--spacing-1)' }}>
                      {campaign.createdBy}
                    </div>
                  </div>
                  
                  <div>
                    <label style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-500)' }}>
                      {t('details.createdOn')}
                    </label>
                    <div style={{ marginTop: 'var(--spacing-1)' }}>
                      {formatDate(campaign.createdAt)}
                    </div>
                  </div>
                  
                  <div>
                    <label style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-500)' }}>
                      {t('details.lastUpdated')}
                    </label>
                    <div style={{ marginTop: 'var(--spacing-1)' }}>
                      {formatDate(campaign.updatedAt)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Template Configuration */}
              <div>
                <h4 style={{ marginBottom: 'var(--spacing-3)', color: 'var(--gray-700)' }}>
                  {t('details.templateConfiguration')}
                </h4>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: 'var(--spacing-6)'
                }}>
                  <div>
                    <label style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-500)' }}>
                      {t('campaigns.emailTemplate')}
                    </label>
                    <div style={{ marginTop: 'var(--spacing-1)', fontWeight: '500' }}>
                      {campaign.emailTemplateName}
                    </div>
                    <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-500)' }}>
                      {t('details.id')}: {campaign.emailTemplateId}
                    </div>
                  </div>
                  
                  <div>
                    <label style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-500)' }}>
                      {t('campaigns.smsFailover')}
                    </label>
                    <div style={{ marginTop: 'var(--spacing-1)' }}>
                      {campaign.enableSmsFailover ? (
                        <span style={{ color: 'var(--success-color)' }}>✓ {t('campaigns.enabled')}</span>
                      ) : (
                        <span style={{ color: 'var(--gray-500)' }}>{t('campaigns.disabled')}</span>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <label style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-500)' }}>
                      {t('campaigns.smsTemplate')}
                    </label>
                    <div style={{ marginTop: 'var(--spacing-1)', fontWeight: '500' }}>
                      {campaign.enableSmsFailover && campaign.smsTemplateName ? (
                        campaign.smsTemplateName
                      ) : (
                        <span style={{ color: 'var(--gray-400)', fontStyle: 'italic' }}>{t('details.notConfigured')}</span>
                      )}
                    </div>
                    <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-500)' }}>
                      {campaign.enableSmsFailover && campaign.smsTemplateId ? (
                        `${t('details.id')}: ${campaign.smsTemplateId}`
                      ) : (
                        <span style={{ color: 'var(--gray-400)', fontStyle: 'italic' }}>{t('details.noId')}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Campaign Statistics */}
              <div>
                <h4 style={{ marginBottom: 'var(--spacing-3)', color: 'var(--gray-700)' }}>
                  {t('details.campaignStatistics')}
                </h4>
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
                      {campaign.totalRecords}
                    </div>
                    <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)' }}>{t('details.total')}</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'bold', color: 'var(--success-color)' }}>
                      {campaign.successCount}
                    </div>
                    <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)' }}>{t('details.success')}</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'bold', color: 'var(--error-color)' }}>
                      {campaign.failedCount}
                    </div>
                    <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)' }}>{t('details.failed')}</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'bold', color: 'var(--warning-color)' }}>
                      {campaign.bouncedCount}
                    </div>
                    <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)' }}>{t('details.bounced')}</div>
                  </div>
                  {campaign.enableSmsFailover && (
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'bold', color: 'var(--info-color)' }}>
                        {campaign.smsSentCount}
                      </div>
                      <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)' }}>{t('details.smsSent')}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CSV Data Status */}
        {campaign.csvData && campaign.csvData.length > 0 && (
          <StatusViewer csvData={campaign.csvData} />
        )}
      </main>
    </div>
  );
};

export default CampaignDetailsPage;
