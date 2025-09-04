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
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCampaigns, setTotalCampaigns] = useState(0);

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
      setTotalCampaigns(campaignsData.length);
    } catch (error) {
      console.error('CampaignsDashboard: Error loading campaigns:', error);
      setError(t('errors.loadCampaignsFailed'));
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
      setError(t('errors.createCampaignFailed'));
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

  // Pagination helper functions
  const totalPages = Math.ceil(totalCampaigns / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentCampaigns = campaigns.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1); // Reset to first page when changing page size
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
            {t('campaigns.dashboardTitle')}
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
        {/* Page Header */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: 'var(--spacing-6)'
        }}>
          <div>
            <h2 style={{ margin: 0, color: 'var(--gray-900)' }}>
              {t('campaigns.title')}
            </h2>
            <p style={{ margin: 'var(--spacing-2) 0 0 0', color: 'var(--gray-600)' }}>
              {t('campaigns.subtitle')}
            </p>
          </div>
          
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary btn-lg"
          >
            + {t('campaigns.createNew')}
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
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center' 
            }}>
              <h3 className="card-title">{t('campaigns.allCampaigns')} ({totalCampaigns})</h3>
              
              {/* Page Size Selector */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)' }}>
                <label style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)' }}>
                  {t('campaigns.showPerPage')}:
                </label>
                <select
                  value={pageSize}
                  onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                  style={{
                    padding: 'var(--spacing-2)',
                    border: '1px solid var(--gray-300)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: 'var(--font-size-sm)'
                  }}
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)' }}>
                  {t('campaigns.perPage')}
                </span>
              </div>
            </div>
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
                  {t('campaigns.noCampaigns')}
                </h4>
                <p style={{ margin: 0, color: 'var(--gray-500)' }}>
                  {t('campaigns.noCampaignsSubtitle')}
                </p>
              </div>
            ) : (
              <>
                <div style={{ overflow: 'auto' }}>
                  <table className="table">
                    <thead>
                      <tr>
                        <th>{t('campaigns.campaignName')}</th>
                        <th>{t('campaigns.status')}</th>
                        <th>{t('campaigns.emailTemplate')}</th>
                        <th>{t('campaigns.smsFailover')}</th>
                        <th>{t('campaigns.scheduling')}</th>
                        <th>{t('campaigns.records')}</th>
                        <th>{t('campaigns.successRate')}</th>
                        <th>{t('campaigns.created')}</th>
                        <th>{t('campaigns.actions')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentCampaigns.map((campaign) => (
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
                              <span style={{ color: 'var(--success-color)' }}>✓ {t('campaigns.enabled')}</span>
                            ) : (
                              <span style={{ color: 'var(--gray-500)' }}>{t('campaigns.disabled')}</span>
                            )}
                          </td>
                          <td>
                            {campaign.sendImmediately ? (
                              <span style={{ color: 'var(--info-color)' }}>{t('campaigns.immediate')}</span>
                            ) : campaign.scheduledAt ? (
                              <div style={{ fontSize: 'var(--font-size-sm)' }}>
                                <div style={{ color: 'var(--success-color)' }}>{t('campaigns.scheduled')}</div>
                                <div style={{ color: 'var(--gray-600)', fontSize: 'var(--font-size-xs)' }}>
                                  {new Date(campaign.scheduledAt).toLocaleDateString()}
                                </div>
                                <div style={{ color: 'var(--gray-500)', fontSize: 'var(--font-size-xs)' }}>
                                  {new Date(campaign.scheduledAt).toLocaleTimeString()}
                                </div>
                              </div>
                            ) : (
                              <span style={{ color: 'var(--gray-500)' }}>{t('campaigns.notSet')}</span>
                            )}
                          </td>
                          <td>
                            <div style={{ textAlign: 'center' }}>
                              <div style={{ fontWeight: '600' }}>{campaign.totalRecords}</div>
                              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-500)' }}>
                                {t('campaigns.total')}
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
                              {t('campaigns.viewDetails')}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: 'var(--spacing-6)',
                    padding: 'var(--spacing-4)',
                    borderTop: '1px solid var(--gray-200)'
                  }}>
                    <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)' }}>
                      {t('campaigns.showing')} {startIndex + 1} {t('campaigns.to')} {Math.min(endIndex, totalCampaigns)} {t('campaigns.of')} {totalCampaigns} {t('campaigns.campaigns')}
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' }}>
                      {/* Previous Button */}
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="btn btn-sm btn-secondary"
                        style={{ minWidth: '80px' }}
                      >
                        {t('campaigns.previous')}
                      </button>
                      
                      {/* Page Numbers */}
                      <div style={{ display: 'flex', gap: 'var(--spacing-1)' }}>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`btn btn-sm ${currentPage === page ? 'btn-primary' : 'btn-secondary'}`}
                            style={{ minWidth: '40px' }}
                          >
                            {page}
                          </button>
                        ))}
                      </div>
                      
                      {/* Next Button */}
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="btn btn-sm btn-secondary"
                        style={{ minWidth: '80px' }}
                      >
                        {t('campaigns.next')}
                      </button>
                    </div>
                  </div>
                )}
              </>
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
