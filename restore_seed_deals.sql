-- ============================================================================
-- RESTORE CLEAN SEED DEALS
-- Run this in Supabase SQL Editor
-- ============================================================================

-- Delete all existing deals
DELETE FROM deals;

-- Insert clean seed data
INSERT INTO deals (
  company_name,
  deal_name,
  status,
  sector,
  geography,
  revenue,
  ebitda,
  valuation_ask,
  analyst_owner,
  executive_summary,
  key_risks,
  user_id
) VALUES
  (
    'CloudSync Technologies',
    'Project Phoenix',
    'diligence',
    'SaaS',
    'United States',
    12000000,
    4500000,
    96000000,
    'Sarah Chen',
    'Enterprise cloud storage and collaboration platform with 500+ enterprise customers. Strong recurring revenue and 120% net retention rate.',
    'Market competition from Microsoft and Google. Customer concentration risk with top 10 customers representing 45% of ARR.',
    NULL
  ),
  (
    'MedTech Analytics',
    'Project Apollo',
    'loi_signed',
    'Healthcare IT',
    'United States',
    8500000,
    2800000,
    68000000,
    'James Rodriguez',
    'Clinical analytics software for hospital systems. 85 hospital customers, sticky product with 98% retention.',
    'Regulatory changes in healthcare reimbursement. Integration complexity with legacy hospital systems.',
    NULL
  ),
  (
    'PayFlow Systems',
    'Project Cascade',
    'nda_signed',
    'FinTech',
    'Canada',
    15000000,
    5200000,
    120000000,
    'Emily Watson',
    'B2B payment processing for SMBs. Processing $2B annually with strong unit economics and embedded fintech model.',
    'Regulatory scrutiny on payment processors. Churn risk in SMB segment during economic downturn.',
    NULL
  ),
  (
    'EduPlatform Pro',
    'Project Scholar',
    'closed_won',
    'EdTech',
    'United Kingdom',
    6800000,
    1900000,
    48000000,
    'Michael Park',
    'K-12 learning management system with 200 school districts. Strong product-market fit and expansion into corporate training.',
    'Budget cuts in education sector. High customer acquisition costs.',
    NULL
  ),
  (
    'FleetOptix',
    'Project Gateway',
    'diligence',
    'Logistics Tech',
    'Germany',
    11200000,
    3800000,
    89000000,
    'Sarah Chen',
    'Fleet management and route optimization software for logistics companies. IoT integration with real-time tracking.',
    'High dependency on fuel prices and logistics market health. Technology refresh cycle risk.',
    NULL
  ),
  (
    'AdOptimize AI',
    'Project Nexus',
    'ioi_sent',
    'MarTech',
    'United States',
    9300000,
    3100000,
    74000000,
    'James Rodriguez',
    'AI-powered ad optimization platform for e-commerce brands. Strong gross margins at 85% with low churn.',
    'Platform risk with Google and Facebook algorithm changes. Increasing customer acquisition costs.',
    NULL
  ),
  (
    'RealtyAI',
    'Project Skyline',
    'replied',
    'PropTech',
    'Australia',
    4200000,
    1400000,
    33600000,
    'Emily Watson',
    'Property valuation and analysis software for real estate investors. Strong growth in APAC region.',
    'Real estate market cycle sensitivity. Competitive market with low switching costs.',
    NULL
  ),
  (
    'DirectShop Inc',
    'Project Summit',
    'closed_lost',
    'E-commerce',
    'United States',
    7600000,
    1200000,
    45000000,
    'Michael Park',
    'D2C e-commerce enablement platform. Good brand partnerships but weak unit economics.',
    'Failed diligence: High customer churn (35% annually), negative contribution margin on small brands, management team turnover.',
    NULL
  ),
  (
    'LegalTech Solutions',
    'Project Thunder',
    'interested',
    'Legal Tech',
    'United States',
    5100000,
    1700000,
    40800000,
    'Sarah Chen',
    'Contract management and e-signature platform for law firms. Strong word-of-mouth growth.',
    'Competitive market with DocuSign dominance. Feature parity concerns.',
    NULL
  ),
  (
    'SalesForce Pro',
    'Project Velocity',
    'outreach_sent',
    'SaaS',
    'Canada',
    3800000,
    1100000,
    30400000,
    'James Rodriguez',
    'Sales enablement and CRM for mid-market B2B companies. Early stage but strong product reviews.',
    'Early stage with limited track record. Founder key person risk.',
    NULL
  );

-- Verify import
SELECT 
  COUNT(*) as total_deals,
  COUNT(DISTINCT sector) as sectors,
  COUNT(DISTINCT status) as statuses
FROM deals;

-- Show all deals
SELECT 
  company_name,
  status,
  sector,
  revenue,
  valuation_ask,
  analyst_owner
FROM deals
ORDER BY company_name;

-- ============================================================================
-- SUCCESS! 10 clean seed deals restored.
-- ============================================================================










