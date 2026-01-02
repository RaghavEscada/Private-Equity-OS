'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, TrendingDown, DollarSign, Users, Percent, Calendar, AlertCircle } from 'lucide-react'

type Deal = {
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
  mrr?: number
  revenue?: number
  ebitda?: number
  valuation_ask?: number
}

function formatCurrency(value?: number): string {
  if (value === null || value === undefined) return 'N/A'
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}k`
  return `$${value.toFixed(0)}`
}

function formatPercent(value?: number): string {
  if (value === null || value === undefined) return 'N/A'
  return `${value.toFixed(1)}%`
}

function formatNumber(value?: number): string {
  if (value === null || value === undefined) return 'N/A'
  return value.toLocaleString()
}

function formatMultiple(value?: number): string {
  if (value === null || value === undefined) return 'N/A'
  return `${value.toFixed(1)}x`
}

function MetricCard({ 
  label, 
  value, 
  icon: Icon, 
  trend, 
  subtitle,
  variant = 'default' 
}: { 
  label: string
  value: string | number
  icon?: any
  trend?: 'up' | 'down'
  subtitle?: string
  variant?: 'default' | 'success' | 'warning' | 'danger'
}) {
  const bgColor = {
    default: 'bg-zinc-900/50',
    success: 'bg-green-950/30 border-green-900/50',
    warning: 'bg-yellow-950/30 border-yellow-900/50',
    danger: 'bg-red-950/30 border-red-900/50'
  }[variant]

  return (
    <Card className={`p-4 ${bgColor} border-white/10`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-white/60 mb-1">{label}</p>
          <p className="text-2xl font-semibold text-white">{value}</p>
          {subtitle && <p className="text-xs text-white/40 mt-1">{subtitle}</p>}
        </div>
        <div className="flex flex-col items-end gap-1">
          {Icon && <Icon className="w-5 h-5 text-white/40" />}
          {trend && (
            trend === 'up' ? 
              <TrendingUp className="w-4 h-4 text-green-500" /> : 
              <TrendingDown className="w-4 h-4 text-red-500" />
          )}
        </div>
      </div>
    </Card>
  )
}

export default function FinancialMetrics({ deal }: { deal: Deal }) {
  // Calculate derived metrics if base data exists
  const calculatedEVRevenue = deal.valuation_ask && deal.revenue 
    ? deal.valuation_ask / deal.revenue 
    : deal.ev_revenue_multiple

  const calculatedEVEBITDA = deal.valuation_ask && deal.ebitda 
    ? deal.valuation_ask / deal.ebitda 
    : deal.ev_ebitda_multiple

  const calculatedRuleOf40 = (deal.arr_growth_rate || 0) + (deal.ebitda_margin || 0)
  const ruleOf40Score = deal.rule_of_40 || (deal.arr_growth_rate && deal.ebitda_margin ? calculatedRuleOf40 : undefined)

  // Health indicators
  const isHealthyLTVCAC = deal.ltv_cac_ratio && deal.ltv_cac_ratio >= 3
  const isHealthyNRR = deal.net_revenue_retention && deal.net_revenue_retention >= 100
  const isHealthyRuleOf40 = ruleOf40Score && ruleOf40Score >= 40
  const isHealthyRunway = deal.runway_months && deal.runway_months >= 12

  return (
    <div className="space-y-6">
      {/* Revenue Metrics */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
          <DollarSign className="w-5 h-5" />
          Revenue & Growth
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard 
            label="MRR" 
            value={formatCurrency(deal.mrr)} 
            icon={DollarSign}
          />
          <MetricCard 
            label="ARR" 
            value={formatCurrency(deal.arr || (deal.mrr ? deal.mrr * 12 : deal.revenue))} 
            icon={DollarSign}
          />
          <MetricCard 
            label="ARR Growth Rate" 
            value={formatPercent(deal.arr_growth_rate)}
            trend={deal.arr_growth_rate && deal.arr_growth_rate > 0 ? 'up' : undefined}
            variant={deal.arr_growth_rate && deal.arr_growth_rate > 50 ? 'success' : 'default'}
          />
          <MetricCard 
            label="Gross Margin" 
            value={formatPercent(deal.gross_margin)}
            variant={deal.gross_margin && deal.gross_margin > 70 ? 'success' : 'default'}
          />
        </div>
      </div>

      {/* Profitability & Efficiency */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
          <Percent className="w-5 h-5" />
          Profitability & Efficiency
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard 
            label="EBITDA" 
            value={formatCurrency(deal.ebitda)}
          />
          <MetricCard 
            label="EBITDA Margin" 
            value={formatPercent(deal.ebitda_margin)}
            variant={deal.ebitda_margin && deal.ebitda_margin > 20 ? 'success' : deal.ebitda_margin && deal.ebitda_margin < 0 ? 'danger' : 'default'}
          />
          <MetricCard 
            label="Rule of 40" 
            value={ruleOf40Score ? formatPercent(ruleOf40Score) : 'N/A'}
            subtitle={deal.arr_growth_rate && deal.ebitda_margin ? `${formatPercent(deal.arr_growth_rate)} + ${formatPercent(deal.ebitda_margin)}` : undefined}
            variant={isHealthyRuleOf40 ? 'success' : ruleOf40Score && ruleOf40Score < 40 ? 'warning' : 'default'}
          />
          <MetricCard 
            label="Revenue per Employee" 
            value={formatCurrency(deal.revenue_per_employee)}
            subtitle={deal.employee_count ? `${deal.employee_count} employees` : undefined}
          />
        </div>
      </div>

      {/* Unit Economics */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
          <Users className="w-5 h-5" />
          Unit Economics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard 
            label="CAC" 
            value={formatCurrency(deal.cac)}
            subtitle="Customer Acquisition Cost"
          />
          <MetricCard 
            label="LTV" 
            value={formatCurrency(deal.ltv)}
            subtitle="Lifetime Value"
          />
          <MetricCard 
            label="LTV:CAC Ratio" 
            value={formatMultiple(deal.ltv_cac_ratio)}
            variant={isHealthyLTVCAC ? 'success' : deal.ltv_cac_ratio && deal.ltv_cac_ratio < 3 ? 'warning' : 'default'}
            subtitle={isHealthyLTVCAC ? '✓ Healthy (>3x)' : undefined}
          />
          <MetricCard 
            label="CAC Payback" 
            value={deal.payback_period_months ? `${deal.payback_period_months.toFixed(0)} mo` : 'N/A'}
            subtitle="Months to recover CAC"
          />
        </div>
      </div>

      {/* Retention & Churn */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Retention & Customer Metrics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard 
            label="Net Revenue Retention" 
            value={formatPercent(deal.net_revenue_retention)}
            variant={isHealthyNRR ? 'success' : deal.net_revenue_retention && deal.net_revenue_retention < 100 ? 'warning' : 'default'}
            subtitle={isHealthyNRR ? '✓ Healthy (>100%)' : undefined}
          />
          <MetricCard 
            label="Gross Revenue Retention" 
            value={formatPercent(deal.gross_revenue_retention)}
          />
          <MetricCard 
            label="Monthly Churn Rate" 
            value={formatPercent(deal.churn_rate)}
            variant={deal.churn_rate && deal.churn_rate < 2 ? 'success' : deal.churn_rate && deal.churn_rate > 5 ? 'danger' : 'default'}
          />
          <MetricCard 
            label="Total Customers" 
            value={formatNumber(deal.customer_count)}
            subtitle={deal.average_contract_value ? `ACV: ${formatCurrency(deal.average_contract_value)}` : undefined}
          />
        </div>
      </div>

      {/* Cash & Valuation */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
          <DollarSign className="w-5 h-5" />
          Cash & Valuation
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard 
            label="Cash Balance" 
            value={formatCurrency(deal.cash_balance)}
            icon={DollarSign}
          />
          <MetricCard 
            label="Monthly Burn Rate" 
            value={deal.burn_rate ? formatCurrency(deal.burn_rate) : 'N/A'}
            variant={deal.burn_rate && deal.burn_rate > 0 ? 'warning' : 'default'}
          />
          <MetricCard 
            label="Runway" 
            value={deal.runway_months ? `${deal.runway_months.toFixed(0)} mo` : 'N/A'}
            variant={isHealthyRunway ? 'success' : deal.runway_months && deal.runway_months < 6 ? 'danger' : 'warning'}
            icon={AlertCircle}
          />
          <MetricCard 
            label="Total Funding" 
            value={formatCurrency(deal.total_funding)}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          <MetricCard 
            label="Asking Valuation" 
            value={formatCurrency(deal.valuation_ask)}
          />
          <MetricCard 
            label="EV / Revenue" 
            value={formatMultiple(calculatedEVRevenue)}
            subtitle={calculatedEVRevenue ? `${formatCurrency(deal.valuation_ask)} / ${formatCurrency(deal.revenue)}` : undefined}
          />
          <MetricCard 
            label="EV / EBITDA" 
            value={formatMultiple(calculatedEVEBITDA)}
            subtitle={calculatedEVEBITDA ? `${formatCurrency(deal.valuation_ask)} / ${formatCurrency(deal.ebitda)}` : undefined}
          />
        </div>
      </div>

      {/* Quick Health Check */}
      {(isHealthyLTVCAC || isHealthyNRR || isHealthyRuleOf40 || isHealthyRunway) && (
        <Card className="p-4 bg-green-950/20 border-green-900/50">
          <h4 className="text-sm font-semibold text-green-400 mb-2">✓ Positive Indicators</h4>
          <div className="flex flex-wrap gap-2">
            {isHealthyLTVCAC && <Badge variant="outline" className="bg-green-950/50 text-green-300 border-green-800">Strong LTV:CAC ({formatMultiple(deal.ltv_cac_ratio)})</Badge>}
            {isHealthyNRR && <Badge variant="outline" className="bg-green-950/50 text-green-300 border-green-800">High NRR ({formatPercent(deal.net_revenue_retention)})</Badge>}
            {isHealthyRuleOf40 && <Badge variant="outline" className="bg-green-950/50 text-green-300 border-green-800">Rule of 40 Pass ({formatPercent(ruleOf40Score)})</Badge>}
            {isHealthyRunway && <Badge variant="outline" className="bg-green-950/50 text-green-300 border-green-800">Healthy Runway ({deal.runway_months?.toFixed(0)} months)</Badge>}
          </div>
        </Card>
      )}
    </div>
  )
}










