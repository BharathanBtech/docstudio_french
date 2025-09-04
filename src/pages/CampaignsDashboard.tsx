import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Campaign } from '../types';
import apiService from '../services/api';
import CreateCampaignModal from '../components/CreateCampaignModal';

const CampaignsDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    console.log('CampaignsDashboard: Component mounted');
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    try {
      
      console.log('CampaignsDashboard: Loading campaigns...');
      setLoading(true);
      const campaignsData = await apiService.getCampaigns();
      console.log('CampaignsDashboard: Campaigns loaded:', campaignsData);
      setCampaigns(campaignsData);
    } catch (error) {
      console.error('CampaignsDashboard: Error loading campaigns:', error);
      setError('Failed to load campaigns');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCampaign = async (campaignData: any) => {
    try {
      console.log('CampaignsDashboard: Creating campaign:', campaignData);
      await apiService.createCampaign(campaignData);
      setShowCreateModal(false);
      loadCampaigns(); // Refresh the list
    } catch (error) {
      console.error('CampaignsDashboard: Error creating campaign:', error);
      setError('Failed to create campaign');
    }
  };

  const handleViewCampaign = (campaignId: string) => {
    console.log('CampaignsDashboard: Navigating to campaign:', campaignId);
    navigate(`/campaigns/${campaignId}`);
  };

  const handleLogout = () => {
    console.log('CampaignsDashboard: Logging out');
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
    return new Date(dateString).toLocaleDateString();
  };

  console.log('CampaignsDashboard: Rendering, loading:', loading, 'campaigns:', campaigns.length);

  if (loading) {
    console.log('CampaignsDashboard: Showing loading state');
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

  console.log('CampaignsDashboard: Rendering main content');
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
            Campaigns Dashboard
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
        {/* Page Header */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: 'var(--spacing-6)'
        }}>
          <div>
            <h2 style={{ margin: 0, color: 'var(--gray-900)' }}>
              Campaigns
            </h2>
            <p style={{ margin: 'var(--spacing-2) 0 0 0', color: 'var(--gray-600)' }}>
              Manage your email campaigns and track their performance
            </p>
          </div>
          
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary btn-lg"
          >
            + Create New Campaign
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="alert alert-error" style={{ marginBottom: 'var(--spacing-6)' }}>
            {error}
          </div>
        )}

        {/* Campaigns List */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">All Campaigns ({campaigns.length})</h3>
          </div>
          
          <div className="card-body">
            {campaigns.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                padding: 'var(--spacing-12)', 
                color: 'var(--gray-500)' 
              }}>
                <div style={{ fontSize: 'var(--font-size-4xl)', marginBottom: 'var(--spacing-4)' }}>
                  📧
                </div>
                <h4 style={{ margin: '0 0 var(--spacing-2) 0', color: 'var(--gray-700)' }}>
                  No campaigns yet
                </h4>
                <p style={{ margin: 0, color: 'var(--gray-500)' }}>
                  Create your first email campaign to get started
                </p>
              </div>
            ) : (
              <div style={{ overflow: 'auto' }}>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Campaign Name</th>
                      <th>Status</th>
                      <th>Email Template</th>
                      <th>SMS Failover</th>
                      <th>Records</th>
                      <th>Success Rate</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {campaigns.map((campaign) => (
                      <tr key={campaign.id}>
                        <td>
                          <div>
                            <div style={{ fontWeight: '600', color: 'var(--gray-900)' }}>
                              {campaign.name}
                            </div>
                            {campaign.description && (
                              <div style={{ 
                                fontSize: 'var(--font-size-sm)', 
                                color: 'var(--gray-500)',
                                marginTop: 'var(--spacing-1)'
                              }}>
                                {campaign.description}
                              </div>
                            )}
                          </div>
                        </td>
                        <td>{getStatusBadge(campaign.status)}</td>
                        <td>
                          <div style={{ fontSize: 'var(--font-size-sm)' }}>
                            {campaign.emailTemplateName}
                          </div>
                        </td>
                        <td>
                          {campaign.enableSmsFailover ? (
                            <span style={{ color: 'var(--success-color)' }}>✓ Enabled</span>
                          ) : (
                            <span style={{ color: 'var(--gray-500)' }}>Disabled</span>
                          )}
                        </td>
                        <td>
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ fontWeight: '600' }}>{campaign.totalRecords}</div>
                            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-500)' }}>
                              Total
                            </div>
                          </div>
                        </td>
                        <td>
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ fontWeight: '600', color: 'var(--success-color)' }}>
                              {campaign.totalRecords > 0 
                                ? Math.round((campaign.successCount / campaign.totalRecords) * 100)
                                : 0}%
                            </div>
                            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-500)' }}>
                              {campaign.successCount}/{campaign.totalRecords}
                            </div>
                          </div>
                        </td>
                        <td>{formatDate(campaign.createdAt)}</td>
                        <td>
                          <button
                            onClick={() => handleViewCampaign(campaign.id)}
                            className="btn btn-sm btn-primary"
                          >
                            View Details
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
      </main>

      {/* Create Campaign Modal */}
      {showCreateModal && (
        <CreateCampaignModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateCampaign}
        />
      )}
    </div>
  );
};

export default CampaignsDashboard;
