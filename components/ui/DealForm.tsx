'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'

type DealFormData = {
  deal_name: string
  company_name: string
  status: string
  sector: string
  geography: string
  revenue: string
  ebitda: string
  valuation_ask: string
  analyst_owner: string
  executive_summary: string
  key_risks: string
  // Financial Metrics
  mrr: string
  arr: string
  arr_growth_rate: string
  gross_margin: string
  ebitda_margin: string
  cac: string
  ltv: string
  ltv_cac_ratio: string
  net_revenue_retention: string
  gross_revenue_retention: string
  churn_rate: string
  customer_count: string
  average_contract_value: string
  burn_rate: string
  runway_months: string
  cash_balance: string
  employee_count: string
}

export function DealForm({ onSuccess, onClose }: { onSuccess?: () => void; onClose: () => void }) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<DealFormData>({
    deal_name: '',
    company_name: '',
    status: 'outreach_sent',
    sector: '',
    geography: '',
    revenue: '',
    ebitda: '',
    valuation_ask: '',
    analyst_owner: '',
    executive_summary: '',
    key_risks: '',
    mrr: '',
    arr: '',
    arr_growth_rate: '',
    gross_margin: '',
    ebitda_margin: '',
    cac: '',
    ltv: '',
    ltv_cac_ratio: '',
    net_revenue_retention: '',
    gross_revenue_retention: '',
    churn_rate: '',
    customer_count: '',
    average_contract_value: '',
    burn_rate: '',
    runway_months: '',
    cash_balance: '',
    employee_count: '',
  })
  const [showFinancials, setShowFinancials] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase.from('deals').insert({
        deal_name: formData.deal_name,
        company_name: formData.company_name,
        status: formData.status,
        sector: formData.sector || null,
        geography: formData.geography || null,
        revenue: formData.revenue ? parseFloat(formData.revenue) : null,
        ebitda: formData.ebitda ? parseFloat(formData.ebitda) : null,
        valuation_ask: formData.valuation_ask ? parseFloat(formData.valuation_ask) : null,
        analyst_owner: formData.analyst_owner || null,
        executive_summary: formData.executive_summary || null,
        key_risks: formData.key_risks || null,
        // Financial metrics
        mrr: formData.mrr ? parseFloat(formData.mrr) : null,
        arr: formData.arr ? parseFloat(formData.arr) : null,
        arr_growth_rate: formData.arr_growth_rate ? parseFloat(formData.arr_growth_rate) : null,
        gross_margin: formData.gross_margin ? parseFloat(formData.gross_margin) : null,
        ebitda_margin: formData.ebitda_margin ? parseFloat(formData.ebitda_margin) : null,
        cac: formData.cac ? parseFloat(formData.cac) : null,
        ltv: formData.ltv ? parseFloat(formData.ltv) : null,
        ltv_cac_ratio: formData.ltv_cac_ratio ? parseFloat(formData.ltv_cac_ratio) : null,
        net_revenue_retention: formData.net_revenue_retention ? parseFloat(formData.net_revenue_retention) : null,
        gross_revenue_retention: formData.gross_revenue_retention ? parseFloat(formData.gross_revenue_retention) : null,
        churn_rate: formData.churn_rate ? parseFloat(formData.churn_rate) : null,
        customer_count: formData.customer_count ? parseInt(formData.customer_count) : null,
        average_contract_value: formData.average_contract_value ? parseFloat(formData.average_contract_value) : null,
        burn_rate: formData.burn_rate ? parseFloat(formData.burn_rate) : null,
        runway_months: formData.runway_months ? parseFloat(formData.runway_months) : null,
        cash_balance: formData.cash_balance ? parseFloat(formData.cash_balance) : null,
        employee_count: formData.employee_count ? parseInt(formData.employee_count) : null,
        user_id: null, // Deals are shared across all users
      })

      if (error) throw error

      onSuccess?.()
      onClose()
    } catch (error: any) {
      alert(`Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pb-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="deal_name">Deal Name *</Label>
          <Input
            id="deal_name"
            value={formData.deal_name}
            onChange={(e) => setFormData({ ...formData, deal_name: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="company_name">Company Name *</Label>
          <Input
            id="company_name"
            value={formData.company_name}
            onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="status">Status *</Label>
          <select
            id="status"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            required
          >
            <option value="outreach_sent">Outreach Sent</option>
            <option value="replied">Replied</option>
            <option value="interested">Interested</option>
            <option value="nda_signed">NDA Signed</option>
            <option value="ioi_sent">IOI Sent</option>
            <option value="loi_signed">LOI Signed</option>
            <option value="diligence">Diligence</option>
            <option value="closed_won">Closed Won</option>
            <option value="closed_lost">Closed Lost</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="sector">Sector</Label>
          <Input
            id="sector"
            value={formData.sector}
            onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
            placeholder="e.g., SaaS, FinTech"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="geography">Geography</Label>
          <Input
            id="geography"
            value={formData.geography}
            onChange={(e) => setFormData({ ...formData, geography: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="analyst_owner">Analyst Owner</Label>
          <Input
            id="analyst_owner"
            value={formData.analyst_owner}
            onChange={(e) => setFormData({ ...formData, analyst_owner: e.target.value })}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="revenue">Revenue ($)</Label>
          <Input
            id="revenue"
            type="number"
            value={formData.revenue}
            onChange={(e) => setFormData({ ...formData, revenue: e.target.value })}
            placeholder="0"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="ebitda">EBITDA ($)</Label>
          <Input
            id="ebitda"
            type="number"
            value={formData.ebitda}
            onChange={(e) => setFormData({ ...formData, ebitda: e.target.value })}
            placeholder="0"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="valuation_ask">Valuation Ask ($)</Label>
          <Input
            id="valuation_ask"
            type="number"
            value={formData.valuation_ask}
            onChange={(e) => setFormData({ ...formData, valuation_ask: e.target.value })}
            placeholder="0"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="executive_summary">Executive Summary</Label>
        <Textarea
          id="executive_summary"
          value={formData.executive_summary}
          onChange={(e) => setFormData({ ...formData, executive_summary: e.target.value })}
          rows={4}
          placeholder="Brief overview of the deal..."
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="key_risks">Key Risks</Label>
        <Textarea
          id="key_risks"
          value={formData.key_risks}
          onChange={(e) => setFormData({ ...formData, key_risks: e.target.value })}
          rows={3}
          placeholder="Key risks and concerns..."
        />
      </div>

      {/* Financial Metrics Section */}
      <div className="border-t border-zinc-800 pt-6">
        <button
          type="button"
          onClick={() => setShowFinancials(!showFinancials)}
          className="flex items-center justify-between w-full text-left mb-4"
        >
          <h3 className="text-sm font-semibold text-white uppercase tracking-wide">
            Financial Metrics (Optional)
          </h3>
          <span className="text-zinc-500">{showFinancials ? '▼' : '▶'}</span>
        </button>

        {showFinancials && (
          <div className="space-y-6">
            {/* Revenue Metrics */}
            <div>
              <p className="text-xs text-zinc-500 uppercase tracking-wide mb-3">Revenue & Growth</p>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="mrr">MRR ($)</Label>
                  <Input
                    id="mrr"
                    type="number"
                    value={formData.mrr}
                    onChange={(e) => setFormData({ ...formData, mrr: e.target.value })}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="arr">ARR ($)</Label>
                  <Input
                    id="arr"
                    type="number"
                    value={formData.arr}
                    onChange={(e) => setFormData({ ...formData, arr: e.target.value })}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="arr_growth_rate">ARR Growth (%)</Label>
                  <Input
                    id="arr_growth_rate"
                    type="number"
                    value={formData.arr_growth_rate}
                    onChange={(e) => setFormData({ ...formData, arr_growth_rate: e.target.value })}
                    placeholder="0"
                  />
                </div>
              </div>
            </div>

            {/* Margins */}
            <div>
              <p className="text-xs text-zinc-500 uppercase tracking-wide mb-3">Margins</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="gross_margin">Gross Margin (%)</Label>
                  <Input
                    id="gross_margin"
                    type="number"
                    value={formData.gross_margin}
                    onChange={(e) => setFormData({ ...formData, gross_margin: e.target.value })}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ebitda_margin">EBITDA Margin (%)</Label>
                  <Input
                    id="ebitda_margin"
                    type="number"
                    value={formData.ebitda_margin}
                    onChange={(e) => setFormData({ ...formData, ebitda_margin: e.target.value })}
                    placeholder="0"
                  />
                </div>
              </div>
            </div>

            {/* Unit Economics */}
            <div>
              <p className="text-xs text-zinc-500 uppercase tracking-wide mb-3">Unit Economics</p>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cac">CAC ($)</Label>
                  <Input
                    id="cac"
                    type="number"
                    value={formData.cac}
                    onChange={(e) => setFormData({ ...formData, cac: e.target.value })}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ltv">LTV ($)</Label>
                  <Input
                    id="ltv"
                    type="number"
                    value={formData.ltv}
                    onChange={(e) => setFormData({ ...formData, ltv: e.target.value })}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ltv_cac_ratio">LTV:CAC Ratio</Label>
                  <Input
                    id="ltv_cac_ratio"
                    type="number"
                    value={formData.ltv_cac_ratio}
                    onChange={(e) => setFormData({ ...formData, ltv_cac_ratio: e.target.value })}
                    placeholder="0"
                  />
                </div>
              </div>
            </div>

            {/* Retention & Churn */}
            <div>
              <p className="text-xs text-zinc-500 uppercase tracking-wide mb-3">Retention & Churn</p>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="net_revenue_retention">NRR (%)</Label>
                  <Input
                    id="net_revenue_retention"
                    type="number"
                    value={formData.net_revenue_retention}
                    onChange={(e) => setFormData({ ...formData, net_revenue_retention: e.target.value })}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gross_revenue_retention">GRR (%)</Label>
                  <Input
                    id="gross_revenue_retention"
                    type="number"
                    value={formData.gross_revenue_retention}
                    onChange={(e) => setFormData({ ...formData, gross_revenue_retention: e.target.value })}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="churn_rate">Churn Rate (%)</Label>
                  <Input
                    id="churn_rate"
                    type="number"
                    value={formData.churn_rate}
                    onChange={(e) => setFormData({ ...formData, churn_rate: e.target.value })}
                    placeholder="0"
                  />
                </div>
              </div>
            </div>

            {/* Customer Metrics */}
            <div>
              <p className="text-xs text-zinc-500 uppercase tracking-wide mb-3">Customer Metrics</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customer_count">Total Customers</Label>
                  <Input
                    id="customer_count"
                    type="number"
                    value={formData.customer_count}
                    onChange={(e) => setFormData({ ...formData, customer_count: e.target.value })}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="average_contract_value">Avg Contract Value ($)</Label>
                  <Input
                    id="average_contract_value"
                    type="number"
                    value={formData.average_contract_value}
                    onChange={(e) => setFormData({ ...formData, average_contract_value: e.target.value })}
                    placeholder="0"
                  />
                </div>
              </div>
            </div>

            {/* Cash & Runway */}
            <div>
              <p className="text-xs text-zinc-500 uppercase tracking-wide mb-3">Cash & Operations</p>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cash_balance">Cash Balance ($)</Label>
                  <Input
                    id="cash_balance"
                    type="number"
                    value={formData.cash_balance}
                    onChange={(e) => setFormData({ ...formData, cash_balance: e.target.value })}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="burn_rate">Monthly Burn ($)</Label>
                  <Input
                    id="burn_rate"
                    type="number"
                    value={formData.burn_rate}
                    onChange={(e) => setFormData({ ...formData, burn_rate: e.target.value })}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="runway_months">Runway (months)</Label>
                  <Input
                    id="runway_months"
                    type="number"
                    value={formData.runway_months}
                    onChange={(e) => setFormData({ ...formData, runway_months: e.target.value })}
                    placeholder="0"
                  />
                </div>
              </div>
            </div>

            {/* Employee Count */}
            <div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="employee_count">Employee Count</Label>
                  <Input
                    id="employee_count"
                    type="number"
                    value={formData.employee_count}
                    onChange={(e) => setFormData({ ...formData, employee_count: e.target.value })}
                    placeholder="0"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Deal'
          )}
        </Button>
      </div>
    </form>
  )
}

