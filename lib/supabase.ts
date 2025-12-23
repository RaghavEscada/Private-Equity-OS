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
  created_at: string
  updated_at: string
}