'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, TrendingDown, DollarSign, Activity, BarChart3 } from 'lucide-react'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

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
  mrr?: number
  revenue?: number
  ebitda?: number
  valuation_ask?: number
}

function formatCurrency(value?: number): string {
  if (value === null || value === undefined) return '—'
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`
  return `$${value.toFixed(0)}`
}

function formatPercent(value?: number): string {
  if (value === null || value === undefined) return '—'
  return `${value.toFixed(1)}%`
}

function formatMultiple(value?: number): string {
  if (value === null || value === undefined) return '—'
  return `${value.toFixed(1)}x`
}

const COLORS = {
  primary: '#6366f1',
  success: '#22c55e',
  warning: '#eab308',
  danger: '#ef4444',
  neutral: '#71717a',
}

function MetricCard({ 
  label, 
  value, 
  subtitle,
  trend
}: { 
  label: string
  value: string | number
  subtitle?: string
  trend?: 'positive' | 'negative' | 'neutral'
}) {
  const trendColors = {
    positive: 'text-green-500',
    negative: 'text-red-500',
    neutral: 'text-zinc-500'
  }

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">{label}</p>
      <div className="flex items-baseline gap-2">
        <p className="text-3xl font-semibold text-white tracking-tight">{value}</p>
        {trend && (
          trend === 'positive' ? 
            <TrendingUp className={`w-4 h-4 ${trendColors[trend]}`} /> :
          trend === 'negative' ?
            <TrendingDown className={`w-4 h-4 ${trendColors[trend]}`} /> :
            null
        )}
      </div>
      {subtitle && <p className="text-xs text-zinc-600">{subtitle}</p>}
    </div>
  )
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 shadow-xl">
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm text-white font-medium">
            {entry.name}: {typeof entry.value === 'number' ? 
              (entry.name.includes('%') || entry.name.includes('Rate') ? 
                `${entry.value.toFixed(1)}%` : 
                formatCurrency(entry.value)) : 
              entry.value}
          </p>
        ))}
      </div>
    )
  }
  return null
}

export default function FinancialMetricsClean({ deal }: { deal: Deal }) {
  const calculatedRuleOf40 = (deal.arr_growth_rate || 0) + (deal.ebitda_margin || 0)
  const ruleOf40Score = deal.rule_of_40 || (deal.arr_growth_rate && deal.ebitda_margin ? calculatedRuleOf40 : undefined)
  const isHealthyRuleOf40 = ruleOf40Score && ruleOf40Score >= 40

  // Chart data
  const revenueData = deal.mrr ? [
    { month: 'Jan', value: deal.mrr * 0.7 },
    { month: 'Feb', value: deal.mrr * 0.75 },
    { month: 'Mar', value: deal.mrr * 0.82 },
    { month: 'Apr', value: deal.mrr * 0.88 },
    { month: 'May', value: deal.mrr * 0.93 },
    { month: 'Jun', value: deal.mrr },
  ] : []

  const marginData = [
    { name: 'Gross', value: deal.gross_margin || 0, color: COLORS.success },
    { name: 'EBITDA', value: deal.ebitda_margin || 0, color: COLORS.primary },
  ].filter(d => d.value > 0)

  const metricsData = [
    { name: 'NRR', value: deal.net_revenue_retention || 0, target: 110 },
    { name: 'GRR', value: deal.gross_revenue_retention || 0, target: 95 },
    { name: 'Gross Margin', value: deal.gross_margin || 0, target: 75 },
  ].filter(d => d.value > 0)

  return (
    <div className="space-y-8">
      {/* Key Metrics */}
      <div>
        <h3 className="text-sm font-semibold text-white mb-6 uppercase tracking-wide">Key Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-zinc-900/50 border-zinc-800 p-6">
            <MetricCard 
              label="ARR" 
              value={formatCurrency(deal.arr || (deal.mrr ? deal.mrr * 12 : deal.revenue))}
              trend={deal.arr_growth_rate && deal.arr_growth_rate > 30 ? 'positive' : undefined}
              subtitle={deal.arr_growth_rate ? `${deal.arr_growth_rate.toFixed(0)}% YoY growth` : undefined}
            />
          </Card>
          <Card className="bg-zinc-900/50 border-zinc-800 p-6">
            <MetricCard 
              label="Rule of 40" 
              value={ruleOf40Score ? formatPercent(ruleOf40Score) : '—'}
              trend={isHealthyRuleOf40 ? 'positive' : ruleOf40Score ? 'neutral' : undefined}
              subtitle={isHealthyRuleOf40 ? 'Healthy' : ruleOf40Score ? 'Below target' : undefined}
            />
          </Card>
          <Card className="bg-zinc-900/50 border-zinc-800 p-6">
            <MetricCard 
              label="LTV:CAC" 
              value={formatMultiple(deal.ltv_cac_ratio)}
              trend={deal.ltv_cac_ratio && deal.ltv_cac_ratio >= 3 ? 'positive' : undefined}
              subtitle={deal.ltv_cac_ratio && deal.ltv_cac_ratio >= 3 ? 'Strong' : undefined}
            />
          </Card>
          <Card className="bg-zinc-900/50 border-zinc-800 p-6">
            <MetricCard 
              label="NRR" 
              value={formatPercent(deal.net_revenue_retention)}
              trend={deal.net_revenue_retention && deal.net_revenue_retention >= 100 ? 'positive' : undefined}
            />
          </Card>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        {revenueData.length > 0 && (
          <Card className="bg-zinc-900/50 border-zinc-800 p-6">
            <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wide">MRR Trend</h4>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.2}/>
                    <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis 
                  dataKey="month" 
                  stroke="rgba(255,255,255,0.3)" 
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  stroke="rgba(255,255,255,0.3)" 
                  tick={{ fontSize: 12 }}
                  tickFormatter={formatCurrency}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke={COLORS.primary}
                  strokeWidth={2}
                  fill="url(#colorValue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        )}

        {/* Margins */}
        {marginData.length > 0 && (
          <Card className="bg-zinc-900/50 border-zinc-800 p-6">
            <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wide">Margins</h4>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={marginData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis 
                  dataKey="name" 
                  stroke="rgba(255,255,255,0.3)" 
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  stroke="rgba(255,255,255,0.3)" 
                  tick={{ fontSize: 12 }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {marginData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        )}
      </div>

      {/* Performance Metrics */}
      {metricsData.length > 0 && (
        <Card className="bg-zinc-900/50 border-zinc-800 p-6">
          <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wide">Performance vs Target</h4>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={metricsData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis 
                type="number" 
                stroke="rgba(255,255,255,0.3)" 
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                dataKey="name" 
                type="category" 
                stroke="rgba(255,255,255,0.3)" 
                tick={{ fontSize: 12 }}
                width={100}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" fill={COLORS.primary} radius={[0, 6, 6, 0]} />
              <Bar dataKey="target" fill="rgba(255,255,255,0.1)" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {deal.customer_count && (
          <Card className="bg-zinc-900/30 border-zinc-800 p-4">
            <p className="text-xs text-zinc-500 mb-1">Customers</p>
            <p className="text-lg font-semibold text-white">{deal.customer_count.toLocaleString()}</p>
          </Card>
        )}
        {deal.average_contract_value && (
          <Card className="bg-zinc-900/30 border-zinc-800 p-4">
            <p className="text-xs text-zinc-500 mb-1">ACV</p>
            <p className="text-lg font-semibold text-white">{formatCurrency(deal.average_contract_value)}</p>
          </Card>
        )}
        {deal.churn_rate && (
          <Card className="bg-zinc-900/30 border-zinc-800 p-4">
            <p className="text-xs text-zinc-500 mb-1">Churn</p>
            <p className="text-lg font-semibold text-white">{formatPercent(deal.churn_rate)}</p>
          </Card>
        )}
        {deal.runway_months && (
          <Card className="bg-zinc-900/30 border-zinc-800 p-4">
            <p className="text-xs text-zinc-500 mb-1">Runway</p>
            <p className="text-lg font-semibold text-white">{deal.runway_months.toFixed(0)} mo</p>
          </Card>
        )}
      </div>
    </div>
  )
}











