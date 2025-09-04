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
      setError('Failed to load campaign details');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { class: 'badge-pending', text: 'Draft' },
      active: { class: 'badge-success', text: 'Active' },
      paused: { class: 'badge-warning', text: 'Paused' },
      completed: { class: 'badge-info', text: 'Completed' },
      failed: { class: 'badge-error', text: 'Failed' }
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
          <h2>Campaign not found</h2>
          <button 
            onClick={() => navigate('/campaigns')}
            className="btn btn-primary"
          >
            Back to Campaigns
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
          <h1 style={{ 
            color: 'var(--primary-color)', 
            fontSize: 'var(--font-size-2xl)',
            margin: 0
          }}>
            DocStudio
          </h1>
          <span style={{ color: 'var(--gray-500)', fontSize: 'var(--font-size-lg)' }}>
            Campaign Details
          </span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-4)' }}>
          <span style={{ color: 'var(--gray-600)' }}>
            Welcome, {user?.name}
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
            ← Back to Campaigns
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
                  Campaign Information
                </h4>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                  gap: 'var(--spacing-4)'
                }}>
                  <div>
                    <label style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-500)' }}>
                      Description
                    </label>
                    <div style={{ marginTop: 'var(--spacing-1)' }}>
                      {campaign.description || 'No description provided'}
                    </div>
                  </div>
                  
                  <div>
                    <label style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-500)' }}>
                      Created By
                    </label>
                    <div style={{ marginTop: 'var(--spacing-1)' }}>
                      {campaign.createdBy}
                    </div>
                  </div>
                  
                  <div>
                    <label style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-500)' }}>
                      Created On
                    </label>
                    <div style={{ marginTop: 'var(--spacing-1)' }}>
                      {formatDate(campaign.createdAt)}
                    </div>
                  </div>
                  
                  <div>
                    <label style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-500)' }}>
                      Last Updated
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
                  Template Configuration
                </h4>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                  gap: 'var(--spacing-4)'
                }}>
                  <div>
                    <label style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-500)' }}>
                      Email Template
                    </label>
                    <div style={{ marginTop: 'var(--spacing-1)', fontWeight: '500' }}>
                      {campaign.emailTemplateName}
                    </div>
                    <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-500)' }}>
                      ID: {campaign.emailTemplateId}
                    </div>
                  </div>
                  
                  <div>
                    <label style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-500)' }}>
                      SMS Failover
                    </label>
                    <div style={{ marginTop: 'var(--spacing-1)' }}>
                      {campaign.enableSmsFailover ? (
                        <span style={{ color: 'var(--success-color)' }}>✓ Enabled</span>
                      ) : (
                        <span style={{ color: 'var(--gray-500)' }}>Disabled</span>
                      )}
                    </div>
                  </div>
                  
                  {campaign.enableSmsFailover && campaign.smsTemplateName && (
                    <div>
                      <label style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-500)' }}>
                        SMS Template
                      </label>
                      <div style={{ marginTop: 'var(--spacing-1)', fontWeight: '500' }}>
                        {campaign.smsTemplateName}
                      </div>
                      <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-500)' }}>
                        ID: {campaign.smsTemplateId}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Campaign Statistics */}
              <div>
                <h4 style={{ marginBottom: 'var(--spacing-3)', color: 'var(--gray-700)' }}>
                  Campaign Statistics
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
                    <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)' }}>Total</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'bold', color: 'var(--success-color)' }}>
                      {campaign.successCount}
                    </div>
                    <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)' }}>Success</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'bold', color: 'var(--error-color)' }}>
                      {campaign.failedCount}
                    </div>
                    <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)' }}>Failed</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'bold', color: 'var(--warning-color)' }}>
                      {campaign.bouncedCount}
                    </div>
                    <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)' }}>Bounced</div>
                  </div>
                  {campaign.enableSmsFailover && (
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'bold', color: 'var(--info-color)' }}>
                        {campaign.smsSentCount}
                      </div>
                      <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)' }}>SMS Sent</div>
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
