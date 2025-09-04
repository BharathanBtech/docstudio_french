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
    let status = 'sms_sent';
    let message = 'SMS sent successfully';
    
    if (random < 0.15) {
      status = 'failed';
      message = 'Invalid phone number';
    }
    
    res.json({
      success: status === 'sms_sent',
      data: {
        rowId: `row-${Date.now()}`,
        success: status === 'sms_sent',
        status,
        message,
        timestamp: new Date().toISOString()
      }
    });
  }, 300 + Math.random() * 700); // Random delay between 300ms and 1s
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Mock Activepieces server running on http://localhost:${PORT}`);
  console.log(`📧 Available email templates: ${emailTemplates.length}`);
  console.log(`📱 Available SMS templates: ${smsTemplates.length}`);
  console.log(`\n🔗 Frontend should be running on http://localhost:3001`);
  console.log(`📝 Use the sample CSV file: sample-data.csv`);
});
