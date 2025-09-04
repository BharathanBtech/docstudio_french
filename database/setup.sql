-- Perfect DocStudio Database Setup
-- Run this script to create the necessary tables and indexes

-- Create campaigns table
CREATE TABLE IF NOT EXISTS campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    email_template_id VARCHAR(255) NOT NULL,
    email_template_name VARCHAR(255) NOT NULL,
    sms_template_id VARCHAR(255),
    sms_template_name VARCHAR(255),
    enable_sms_failover BOOLEAN DEFAULT false,
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed', 'failed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    total_records INTEGER DEFAULT 0,
    success_count INTEGER DEFAULT 0,
    failed_count INTEGER DEFAULT 0,
    bounced_count INTEGER DEFAULT 0,
    sms_sent_count INTEGER DEFAULT 0
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

-- Insert sample data (optional)
INSERT INTO campaigns (
    name, 
    description, 
    email_template_id, 
    email_template_name, 
    status, 
    created_by, 
    total_records
) VALUES 
(
    'Welcome Campaign 2024',
    'Welcome emails for new customers',
    'sample-template-1',
    'Welcome Email Template',
    'completed',
    'admin@docstudio.com',
    150
),
(
    'Newsletter Q1 2024',
    'Quarterly newsletter for existing customers',
    'sample-template-2',
    'Newsletter Template',
    'active',
    'admin@docstudio.com',
    75
) ON CONFLICT DO NOTHING;

-- Grant permissions (adjust as needed for your setup)
-- GRANT ALL PRIVILEGES ON TABLE campaigns TO your_app_user;
-- GRANT ALL PRIVILEGES ON TABLE campaign_records TO your_app_user;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO your_app_user;
