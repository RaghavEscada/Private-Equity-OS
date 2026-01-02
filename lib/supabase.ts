// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// TypeScript type for our Deal
export type Deal = {
  id: string
  deal_name: string
  company_name: string
  status: string
  sector: string
  geography: string
  revenue: number
  ebitda: number
  valuation_ask: number
  analyst_owner: string
  executive_summary: string
  key_risks: string
  meeting_notes?: string
  created_at: string
  updated_at: string
  // Additional Notion fields
  deal_type?: string
  seller_social?: string
  contact_email?: string
  source?: string
  mrr?: number
  competitors?: string
  competitive_advantages?: string
  due_date?: string
  follow_up_task?: string
  google_drive_url?: string
  supporting_doc_url?: string
  // Financial Metrics
  arr?: number
  arr_growth_rate?: number
  gross_margin?: number
  ebitda_margin?: number
  burn_rate?: number
  runway_months?: number
  cac?: number
  ltv?: number
  ltv_cac_ratio?: number
  net_revenue_retention?: number
  gross_revenue_retention?: number
  payback_period_months?: number
  rule_of_40?: number
  customer_count?: number
  average_contract_value?: number
  churn_rate?: number
  revenue_per_employee?: number
  employee_count?: number
  cash_balance?: number
  total_funding?: number
  last_round_valuation?: number
  debt_balance?: number
  ev_revenue_multiple?: number
  ev_ebitda_multiple?: number
  fiscal_year_end?: string
  last_financial_update?: string
}