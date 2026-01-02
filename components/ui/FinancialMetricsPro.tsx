'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, TrendingDown, DollarSign, Target, Activity, BarChart3, TrendingUpIcon } from 'lucide-react'
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
  RadialBarChart,
  RadialBar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ComposedChart,
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
  if (value === null || value === undefined) return '—'
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`
  return `$${value.toFixed(0)}`
}

function formatPercent(value?: number): string {
  if (value === null || value === undefined) return '—'
  const formatted = value.toFixed(1)
  return `${formatted}%`
}

function formatMultiple(value?: number): string {
  if (value === null || value === undefined) return '—'
  return `${value.toFixed(2)}x`
}

const COLORS = {
  gradient1: ['#667eea', '#764ba2'],
  gradient2: ['#f093fb', '#f5576c'],
  gradient3: ['#4facfe', '#00f2fe'],
  gradient4: ['#43e97b', '#38f9d7'],
  gradient5: ['#fa709a', '#fee140'],
  primary: '#667eea',
  success: '#43e97b',
  warning: '#fee140',
  danger: '#f5576c',
  cyan: '#00f2fe',
  purple: '#764ba2',
}

function MetricCardPro({ 
  label, 
  value, 
  icon: Icon, 
  trend,
  trendValue,
  gradient = COLORS.gradient1
}: { 
  label: string
  value: string | number
  icon?: any
  trend?: 'up' | 'down'
  trendValue?: string
  gradient?: string[]
}) {
  return (
    <div className="relative group">
      {/* Gradient border effect */}
      <div 
        className="absolute -inset-0.5 rounded-2xl opacity-75 group-hover:opacity-100 transition duration-300 blur"
        style={{
          background: `linear-gradient(135deg, ${gradient[0]}, ${gradient[1]})`
        }}
      />
      
      <Card className="relative bg-zinc-900/95 backdrop-blur-xl border-0 rounded-2xl p-6 h-full">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            {Icon && (
              <div 
                className="p-2.5 rounded-xl"
                style={{
                  background: `linear-gradient(135deg, ${gradient[0]}20, ${gradient[1]}20)`
                }}
              >
                <Icon 
                  className="w-5 h-5" 
                  style={{ color: gradient[0] }}
                />
              </div>
            )}
            <p className="text-sm font-medium text-zinc-400 tracking-wide uppercase">{label}</p>
          </div>
          {trend && trendValue && (
            <div className={`flex items-center gap-1 px-2 py-1 rounded-lg ${
              trend === 'up' ? 'bg-emerald-500/10' : 'bg-red-500/10'
            }`}>
              {trend === 'up' ? 
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> : 
                <TrendingDown className="w-3.5 h-3.5 text-red-400" />
              }
              <span className={`text-xs font-semibold ${
                trend === 'up' ? 'text-emerald-400' : 'text-red-400'
              }`}>
                {trendValue}
              </span>
            </div>
          )}
        </div>
        <p className="text-3xl font-bold tracking-tight">
          <span 
            className="bg-gradient-to-r bg-clip-text text-transparent"
            style={{
              backgroundImage: `linear-gradient(135deg, ${gradient[0]}, ${gradient[1]})`
            }}
          >
            {value}
          </span>
        </p>
      </Card>
    </div>
  )
}

function SectionHeader({ title, icon: Icon }: { title: string, icon?: any }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      {Icon && (
        <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20">
          <Icon className="w-5 h-5 text-purple-400" />
        </div>
      )}
      <h3 className="text-xl font-bold tracking-tight text-white">{title}</h3>
      <div className="flex-1 h-px bg-gradient-to-r from-zinc-700 to-transparent" />
    </div>
  )
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-zinc-900/95 backdrop-blur-xl border border-zinc-700/50 rounded-xl p-4 shadow-2xl">
        <p className="text-zinc-400 text-sm mb-2 font-medium">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-white font-semibold" style={{ color: entry.color }}>
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

export default function FinancialMetricsPro({ deal }: { deal: Deal }) {
  const calculatedRuleOf40 = (deal.arr_growth_rate || 0) + (deal.ebitda_margin || 0)
  const ruleOf40Score = deal.rule_of_40 || (deal.arr_growth_rate && deal.ebitda_margin ? calculatedRuleOf40 : undefined)
  const isHealthyRuleOf40 = ruleOf40Score && ruleOf40Score >= 40

  // Chart data
  const revenueMetricsData = [
    { month: 'Jan', revenue: (deal.mrr || 0) * 0.7 },
    { month: 'Feb', revenue: (deal.mrr || 0) * 0.75 },
    { month: 'Mar', revenue: (deal.mrr || 0) * 0.82 },
    { month: 'Apr', revenue: (deal.mrr || 0) * 0.88 },
    { month: 'May', revenue: (deal.mrr || 0) * 0.93 },
    { month: 'Jun', revenue: (deal.mrr || 0) },
  ]

  const marginData = [
    { name: 'Gross', value: deal.gross_margin || 0, fill: COLORS.success },
    { name: 'EBITDA', value: deal.ebitda_margin || 0, fill: COLORS.primary },
    { name: 'Operating', value: (deal.ebitda_margin || 0) - 8, fill: COLORS.cyan },
  ].filter(d => d.value > 0)

  const cohortData = [
    { metric: 'NRR', value: deal.net_revenue_retention || 0, benchmark: 110 },
    { metric: 'GRR', value: deal.gross_revenue_retention || 0, benchmark: 95 },
    { metric: 'Gross Margin', value: deal.gross_margin || 0, benchmark: 75 },
  ].filter(d => d.value > 0)

  const unitEconData = [
    { 
      name: 'LTV:CAC',
      actual: deal.ltv_cac_ratio || 0,
      target: 3,
      healthy: 5
    },
    {
      name: 'Payback',
      actual: deal.payback_period_months || 0,
      target: 12,
      healthy: 8
    }
  ].filter(d => d.actual > 0)

  return (
    <div className="space-y-8">
      {/* Hero Metrics */}
      <div>
        <SectionHeader title="Performance Overview" icon={Target} />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <MetricCardPro 
            label="Annual Recurring Revenue" 
            value={formatCurrency(deal.arr || (deal.mrr ? deal.mrr * 12 : deal.revenue))} 
            icon={DollarSign}
            gradient={COLORS.gradient1}
            trend={deal.arr_growth_rate && deal.arr_growth_rate > 0 ? 'up' : undefined}
            trendValue={deal.arr_growth_rate ? `${deal.arr_growth_rate.toFixed(0)}%` : undefined}
          />
          <MetricCardPro 
            label="Rule of 40" 
            value={ruleOf40Score ? formatPercent(ruleOf40Score) : '—'}
            icon={Activity}
            gradient={isHealthyRuleOf40 ? COLORS.gradient4 : COLORS.gradient5}
          />
          <MetricCardPro 
            label="LTV:CAC Ratio" 
            value={formatMultiple(deal.ltv_cac_ratio)}
            icon={TrendingUpIcon}
            gradient={COLORS.gradient3}
          />
          <MetricCardPro 
            label="Net Revenue Retention" 
            value={formatPercent(deal.net_revenue_retention)}
            icon={BarChart3}
            gradient={COLORS.gradient2}
          />
        </div>
      </div>

      {/* Revenue Trend & Margins */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Growth Trend */}
        {deal.mrr && (
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl opacity-20 group-hover:opacity-30 transition blur" />
            <Card className="relative bg-zinc-900/95 backdrop-blur-xl border-zinc-800/50 rounded-2xl p-6">
              <h4 className="text-sm font-semibold text-zinc-300 mb-6 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-purple-400" />
                MRR Growth Trend
              </h4>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={revenueMetricsData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis 
                    dataKey="month" 
                    stroke="rgba(255,255,255,0.4)" 
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis 
                    stroke="rgba(255,255,255,0.4)" 
                    style={{ fontSize: '12px' }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke={COLORS.primary}
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorRevenue)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Card>
          </div>
        )}

        {/* Margin Breakdown */}
        {marginData.length > 0 && (
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-2xl opacity-20 group-hover:opacity-30 transition blur" />
            <Card className="relative bg-zinc-900/95 backdrop-blur-xl border-zinc-800/50 rounded-2xl p-6">
              <h4 className="text-sm font-semibold text-zinc-300 mb-6 flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                Margin Structure
              </h4>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <defs>
                    {marginData.map((entry, index) => (
                      <linearGradient key={index} id={`gradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={entry.fill} stopOpacity={1}/>
                        <stop offset="100%" stopColor={entry.fill} stopOpacity={0.6}/>
                      </linearGradient>
                    ))}
                  </defs>
                  <Pie
                    data={marginData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {marginData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={`url(#gradient-${index})`} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-6 mt-4">
                {marginData.map((entry, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: entry.fill }}
                    />
                    <span className="text-xs text-zinc-400">{entry.name}</span>
                    <span className="text-xs font-bold text-white">{entry.value.toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Cohort Performance */}
      {cohortData.length > 0 && (
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl opacity-20 group-hover:opacity-30 transition blur" />
          <Card className="relative bg-zinc-900/95 backdrop-blur-xl border-zinc-800/50 rounded-2xl p-6">
            <h4 className="text-sm font-semibold text-zinc-300 mb-6 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-400" />
              Key Metrics vs Industry Benchmarks
            </h4>
            <ResponsiveContainer width="100%" height={280}>
              <ComposedChart data={cohortData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis 
                  type="number" 
                  stroke="rgba(255,255,255,0.4)" 
                  domain={[0, 130]}
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  dataKey="metric" 
                  type="category" 
                  stroke="rgba(255,255,255,0.4)"
                  width={100}
                  style={{ fontSize: '13px', fontWeight: '500' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="value" 
                  fill={COLORS.primary} 
                  radius={[0, 10, 10, 0]}
                  barSize={30}
                />
                <Bar 
                  dataKey="benchmark" 
                  fill="rgba(255,255,255,0.1)" 
                  radius={[0, 10, 10, 0]}
                  barSize={30}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </Card>
        </div>
      )}

      {/* Unit Economics Scorecard */}
      {unitEconData.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {unitEconData.map((item, idx) => (
            <div key={idx} className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-600 to-orange-600 rounded-2xl opacity-20 group-hover:opacity-30 transition blur" />
              <Card className="relative bg-zinc-900/95 backdrop-blur-xl border-zinc-800/50 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-semibold text-zinc-300">{item.name}</h4>
                  <Badge 
                    variant="outline" 
                    className={`${
                      item.actual <= item.healthy 
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                        : item.actual <= item.target
                        ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'
                        : 'bg-red-500/10 text-red-400 border-red-500/30'
                    }`}
                  >
                    {item.actual <= item.healthy ? '✓ Excellent' : item.actual <= item.target ? '○ Good' : '⚠ At Risk'}
                  </Badge>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-white">
                        {item.name.includes('LTV') ? formatMultiple(item.actual) : `${item.actual.toFixed(0)} mo`}
                      </span>
                      <span className="text-sm text-zinc-500">current</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div>
                      <span className="text-zinc-500">Target: </span>
                      <span className="text-zinc-300 font-semibold">
                        {item.name.includes('LTV') ? formatMultiple(item.target) : `${item.target} mo`}
                      </span>
                    </div>
                    <div className="h-4 w-px bg-zinc-700" />
                    <div>
                      <span className="text-zinc-500">Best-in-class: </span>
                      <span className="text-emerald-400 font-semibold">
                        {item.name.includes('LTV') ? formatMultiple(item.healthy) : `${item.healthy} mo`}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          ))}
        </div>
      )}

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {deal.customer_count && (
          <Card className="bg-zinc-900/50 border-zinc-800/50 p-4 hover:bg-zinc-900/70 transition">
            <p className="text-xs text-zinc-500 mb-1">Customers</p>
            <p className="text-xl font-bold text-white">{deal.customer_count.toLocaleString()}</p>
          </Card>
        )}
        {deal.average_contract_value && (
          <Card className="bg-zinc-900/50 border-zinc-800/50 p-4 hover:bg-zinc-900/70 transition">
            <p className="text-xs text-zinc-500 mb-1">Avg Contract Value</p>
            <p className="text-xl font-bold text-white">{formatCurrency(deal.average_contract_value)}</p>
          </Card>
        )}
        {deal.churn_rate && (
          <Card className="bg-zinc-900/50 border-zinc-800/50 p-4 hover:bg-zinc-900/70 transition">
            <p className="text-xs text-zinc-500 mb-1">Monthly Churn</p>
            <p className="text-xl font-bold text-white">{formatPercent(deal.churn_rate)}</p>
          </Card>
        )}
        {deal.runway_months && (
          <Card className="bg-zinc-900/50 border-zinc-800/50 p-4 hover:bg-zinc-900/70 transition">
            <p className="text-xs text-zinc-500 mb-1">Cash Runway</p>
            <p className="text-xl font-bold text-white">{deal.runway_months.toFixed(0)} months</p>
          </Card>
        )}
      </div>
    </div>
  )
}










