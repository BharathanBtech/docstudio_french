-- Perfect DocStudio Database Setup
-- Run this script to create the necessary tables and indexes

-- Create campaigns table
CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  email_template_id VARCHAR(255) NOT NULL,
  email_template_name VARCHAR(255) NOT NULL,
  sms_template_id VARCHAR(255),
  sms_template_name VARCHAR(255),
  enable_sms_failover BOOLEAN DEFAULT FALSE,
  status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed', 'failed', 'scheduled')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by VARCHAR(255) NOT NULL,
  total_records BIGINT DEFAULT 0,
  success_count BIGINT DEFAULT 0,
  failed_count BIGINT DEFAULT 0,
  bounced_count BIGINT DEFAULT 0,
  sms_sent_count BIGINT DEFAULT 0,
  -- Scheduling fields
  send_immediately BOOLEAN DEFAULT FALSE,
  scheduled_at TIMESTAMP,
  timezone TEXT
);

-- Create campaign_records table to store CSV data
CREATE TABLE IF NOT EXISTS campaign_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    row_data JSONB NOT NULL, -- Store CSV row data as JSON
    email_status VARCHAR(50) DEFAULT 'pending' CHECK (email_status IN ('pending', 'success', 'failed', 'bounced', 'sms_sent')),
    sms_status VARCHAR(50) CHECK (sms_status IN ('pending', 'success', 'failed', 'sms_sent')),
    email_sent_at TIMESTAMP WITH TIME ZONE,
    sms_sent_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_created_at ON campaigns(created_at);
CREATE INDEX IF NOT EXISTS idx_campaigns_created_by ON campaigns(created_by);
CREATE INDEX IF NOT EXISTS idx_campaign_records_campaign_id ON campaign_records(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_records_email_status ON campaign_records(email_status);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_campaigns_updated_at 
    BEFORE UPDATE ON campaigns 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaign_records_updated_at 
    BEFORE UPDATE ON campaign_records 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample campaigns
INSERT INTO campaigns (
  name, 
  description, 
  email_template_id, 
  email_template_name, 
  sms_template_id, 
  sms_template_name, 
  enable_sms_failover, 
  status, 
  created_by, 
  total_records, 
  success_count, 
  failed_count, 
  bounced_count, 
  sms_sent_count,
  send_immediately,
  scheduled_at,
  timezone
) VALUES 
(
  'Welcome Campaign', 
  'Welcome emails for new users', 
  'welcome-template-001', 
  'Welcome Email Template', 
  'welcome-sms-001', 
  'Welcome SMS Template', 
  true, 
  'completed', 
  'admin@docstudio.com', 
  1000, 
  950, 
  30, 
  15, 
  5,
  true,
  NULL,
  NULL
),
(
  'Product Launch', 
  'Announcing our new product line', 
  'launch-template-002', 
  'Product Launch Template', 
  'launch-sms-002', 
  'Product Launch SMS', 
  false, 
  'active', 
  'admin@docstudio.com', 
  500, 
  200, 
  10, 
  5, 
  0,
  true,
  NULL,
  NULL
),
(
  'Holiday Special', 
  'Holiday season promotions', 
  'holiday-template-003', 
  'Holiday Special Template', 
  'holiday-sms-003', 
  'Holiday SMS Template', 
  true, 
  'scheduled', 
  'admin@docstudio.com', 
  2000, 
  0, 
  0, 
  0, 
  0,
  false,
  '2025-01-15 14:30:00',
  'America/New_York'
),
(
  'Weekly Newsletter', 
  'Weekly company updates', 
  'newsletter-template-004', 
  'Newsletter Template', 
  NULL, 
  NULL, 
  false, 
  'draft', 
  'admin@docstudio.com', 
  300, 
  0, 
  0, 
  0, 
  0,
  false,
  '2025-01-20 09:00:00',
  'UTC'
);

-- Grant permissions (adjust as needed for your setup)
-- GRANT ALL PRIVILEGES ON TABLE campaigns TO your_app_user;
-- GRANT ALL PRIVILEGES ON TABLE campaign_records TO your_app_user;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO your_app_user;
