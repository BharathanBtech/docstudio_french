const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3002;

// Middleware
app.use(cors());
app.use(express.json());

// Mock data
const emailTemplates = [
  {
    id: 'email-1',
    name: 'Welcome Email',
    subject: 'Welcome to DocStudio, {{name}}!',
    content: 'Hello {{name}}, welcome to DocStudio! We\'re excited to have you on board.'
  },
  {
    id: 'email-2',
    name: 'Newsletter',
    subject: 'DocStudio Newsletter - {{company}}',
    content: 'Hi {{name}} from {{company}}, here\'s your monthly update from DocStudio.'
  },
  {
    id: 'email-3',
    name: 'Product Update',
    subject: 'New Features Available - {{role}}',
    content: 'Dear {{name}}, as a {{role}}, you\'ll be interested in our latest features.'
  }
];

const smsTemplates = [
  {
    id: 'sms-1',
    name: 'Welcome SMS',
    content: 'Welcome {{name}}! Your DocStudio account is ready. Reply STOP to unsubscribe.'
  },
  {
    id: 'sms-2',
    name: 'Alert SMS',
    content: 'Hi {{name}}, important update from DocStudio. Call us at {{phone}} for details.'
  }
];

// Mock campaigns data
let campaigns = [
  {
    id: 'campaign-1',
    name: 'Welcome Campaign 2024',
    description: 'Welcome emails for new customers',
    emailTemplateId: 'email-1',
    emailTemplateName: 'Welcome Email',
    smsTemplateId: 'sms-1',
    smsTemplateName: 'Welcome SMS',
    enableSmsFailover: true,
    csvData: [],
    status: 'completed',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-20T15:30:00Z',
    createdBy: 'admin@docstudio.com',
    totalRecords: 150,
    successCount: 142,
    failedCount: 3,
    bouncedCount: 5,
    smsSentCount: 5
  },
  {
    id: 'campaign-2',
    name: 'Newsletter Q1 2024',
    description: 'Quarterly newsletter for existing customers',
    emailTemplateId: 'email-2',
    emailTemplateName: 'Newsletter',
    smsTemplateId: null,
    smsTemplateName: null,
    enableSmsFailover: false,
    csvData: [],
    status: 'active',
    createdAt: '2024-01-10T09:00:00Z',
    updatedAt: '2024-01-18T14:20:00Z',
    createdBy: 'admin@docstudio.com',
    totalRecords: 75,
    successCount: 68,
    failedCount: 2,
    bouncedCount: 5,
    smsSentCount: 0
  }
];

// Routes
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/email-templates', (req, res) => {
  res.json({
    success: true,
    data: emailTemplates
  });
});

app.get('/sms-templates', (req, res) => {
  res.json({
    success: true,
    data: smsTemplates
  });
});

// Campaigns endpoints
app.get('/campaigns', (req, res) => {
  res.json({
    success: true,
    data: campaigns
  });
});

app.get('/campaigns/:id', (req, res) => {
  const campaign = campaigns.find(c => c.id === req.params.id);
  if (campaign) {
    res.json({
      success: true,
      data: campaign
    });
  } else {
    res.status(404).json({
      success: false,
      error: 'Campaign not found'
    });
  }
});

app.post('/campaigns', (req, res) => {
  const { name, description, emailTemplateId, smsTemplateId, enableSmsFailover, csvData } = req.body;
  
  // Find template names
  const emailTemplate = emailTemplates.find(t => t.id === emailTemplateId);
  const smsTemplate = smsTemplates.find(t => t.id === smsTemplateId);
  
  const newCampaign = {
    id: `campaign-${Date.now()}`,
    name,
    description,
    emailTemplateId,
    emailTemplateName: emailTemplate?.name || 'Unknown Template',
    smsTemplateId: enableSmsFailover ? smsTemplateId : null,
    smsTemplateName: enableSmsFailover ? smsTemplate?.name || null : null,
    enableSmsFailover,
    csvData: csvData || [],
    status: 'draft',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'admin@docstudio.com',
    totalRecords: csvData?.length || 0,
    successCount: 0,
    failedCount: 0,
    bouncedCount: 0,
    smsSentCount: 0
  };
  
  campaigns.push(newCampaign);
  
  res.json({
    success: true,
    data: newCampaign
  });
});

app.put('/campaigns/:id', (req, res) => {
  const campaignIndex = campaigns.findIndex(c => c.id === req.params.id);
  if (campaignIndex !== -1) {
    campaigns[campaignIndex] = {
      ...campaigns[campaignIndex],
      ...req.body,
      updatedAt: new Date().toISOString()
    };
    
    res.json({
      success: true,
      data: campaigns[campaignIndex]
    });
  } else {
    res.status(404).json({
      success: false,
      error: 'Campaign not found'
    });
  }
});

app.delete('/campaigns/:id', (req, res) => {
  const campaignIndex = campaigns.findIndex(c => c.id === req.params.id);
  if (campaignIndex !== -1) {
    campaigns.splice(campaignIndex, 1);
    res.json({ success: true });
  } else {
    res.status(404).json({
      success: false,
      error: 'Campaign not found'
    });
  }
});

app.post('/campaigns/:id/start', (req, res) => {
  const campaign = campaigns.find(c => c.id === req.params.id);
  if (campaign) {
    campaign.status = 'active';
    campaign.updatedAt = new Date().toISOString();
    res.json({ success: true });
  } else {
    res.status(404).json({
      success: false,
      error: 'Campaign not found'
    });
  }
});

app.post('/campaigns/:id/pause', (req, res) => {
  const campaign = campaigns.find(c => c.id === req.params.id);
  if (campaign) {
    campaign.status = 'paused';
    campaign.updatedAt = new Date().toISOString();
    res.json({ success: true });
  } else {
    res.status(404).json({
      success: false,
      error: 'Campaign not found'
    });
  }
});

app.post('/send-email', (req, res) => {
  const { templateId, recipientEmail, variables } = req.body;
  
  // Simulate processing delay
  setTimeout(() => {
    // Simulate some failures and bounces
    const random = Math.random();
    let status = 'success';
    let message = 'Email sent successfully';
    
    if (random < 0.1) {
      status = 'failed';
      message = 'Invalid email address';
    } else if (random < 0.2) {
      status = 'bounced';
      message = 'Email bounced - recipient mailbox full';
    }
    
    res.json({
      success: status === 'success',
      data: {
        rowId: `row-${Date.now()}`,
        success: status === 'success',
        status,
        message,
        timestamp: new Date().toISOString()
      }
    });
  }, 500 + Math.random() * 1000); // Random delay between 500ms and 1.5s
});

app.post('/send-sms', (req, res) => {
  const { templateId, recipientPhone, variables } = req.body;
  
  // Simulate processing delay
  setTimeout(() => {
    const random = Math.random();
    let status = 'success';
    let message = 'SMS sent successfully';
    
    if (random < 0.1) {
      status = 'failed';
      message = 'Invalid phone number';
    }
    
    res.json({
      success: status === 'success',
      data: {
        rowId: `row-${Date.now()}`,
        success: status === 'success',
        status,
        message,
        timestamp: new Date().toISOString()
      }
    });
  }, 300 + Math.random() * 500); // Random delay between 300ms and 800ms
});

// Start server
app.listen(PORT, () => {
  console.log(`Mock server running on http://localhost:${PORT}`);
  console.log('Available endpoints:');
  console.log('- GET  /health');
  console.log('- GET  /email-templates');
  console.log('- GET  /sms-templates');
  console.log('- GET  /campaigns');
  console.log('- GET  /campaigns/:id');
  console.log('- POST /campaigns');
  console.log('- PUT  /campaigns/:id');
  console.log('- DELETE /campaigns/:id');
  console.log('- POST /campaigns/:id/start');
  console.log('- POST /campaigns/:id/pause');
  console.log('- POST /send-email');
  console.log('- POST /send-sms');
});
