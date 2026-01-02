'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, TrendingDown, DollarSign, Users, Percent, AlertCircle, Target, PieChart as PieChartIcon, Check } from 'lucide-react'
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
  Legend,
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

const COLORS = {
  primary: '#3b82f6',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  purple: '#a78bfa',
  pink: '#ec4899',
  cyan: '#06b6d4',
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

export default function FinancialMetricsCharts({ deal }: { deal: Deal }) {
  // Calculate derived metrics
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

  // Prepare chart data
  const marginData = [
    { name: 'Gross Margin', value: deal.gross_margin || 0, fill: COLORS.success },
    { name: 'EBITDA Margin', value: deal.ebitda_margin || 0, fill: COLORS.primary },
    { name: 'Net Margin', value: (deal.ebitda_margin || 0) - 5, fill: COLORS.cyan }, // Approximate
  ].filter(d => d.value > 0)

  const unitEconomicsData = [
    { name: 'CAC', value: deal.cac || 0 },
    { name: 'LTV', value: deal.ltv || 0 },
    { name: 'ACV', value: deal.average_contract_value || 0 },
  ].filter(d => d.value > 0)

  const retentionData = [
    { name: 'NRR', value: deal.net_revenue_retention || 0, target: 100 },
    { name: 'GRR', value: deal.gross_revenue_retention || 0, target: 100 },
  ].filter(d => d.value > 0)

  const cashFlowData = [
    { name: 'Cash', value: deal.cash_balance || 0, fill: COLORS.success },
    { name: 'Burn (Monthly)', value: deal.burn_rate || 0, fill: COLORS.danger },
  ].filter(d => d.value > 0)

  // Rule of 40 gauge data
  const ruleOf40Data = ruleOf40Score ? [{
    name: 'Rule of 40',
    value: ruleOf40Score,
    fill: ruleOf40Score >= 40 ? COLORS.success : COLORS.warning
  }] : []

  // Health score visualization
  const healthScoreData = [
    { 
      metric: 'LTV:CAC', 
      score: deal.ltv_cac_ratio ? Math.min((deal.ltv_cac_ratio / 5) * 100, 100) : 0,
      target: 60,
      actual: deal.ltv_cac_ratio || 0
    },
    { 
      metric: 'NRR', 
      score: deal.net_revenue_retention || 0,
      target: 100,
      actual: deal.net_revenue_retention || 0
    },
    { 
      metric: 'Gross Margin', 
      score: deal.gross_margin || 0,
      target: 70,
      actual: deal.gross_margin || 0
    },
    { 
      metric: 'Growth', 
      score: Math.min(deal.arr_growth_rate || 0, 100),
      target: 50,
      actual: deal.arr_growth_rate || 0
    },
  ].filter(d => d.score > 0)

  return (
    <div className="space-y-6">
      {/* Key Metrics Overview */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
          <Target className="w-5 h-5" />
          Key Metrics Overview
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard 
            label="ARR" 
            value={formatCurrency(deal.arr || (deal.mrr ? deal.mrr * 12 : deal.revenue))} 
            icon={DollarSign}
            trend={deal.arr_growth_rate && deal.arr_growth_rate > 0 ? 'up' : undefined}
          />
          <MetricCard 
            label="ARR Growth" 
            value={formatPercent(deal.arr_growth_rate)}
            variant={deal.arr_growth_rate && deal.arr_growth_rate > 50 ? 'success' : 'default'}
          />
          <MetricCard 
            label="Rule of 40" 
            value={ruleOf40Score ? formatPercent(ruleOf40Score) : 'N/A'}
            variant={isHealthyRuleOf40 ? 'success' : ruleOf40Score && ruleOf40Score < 40 ? 'warning' : 'default'}
            subtitle={isHealthyRuleOf40 ? '✓ Healthy (≥40%)' : undefined}
          />
          <MetricCard 
            label="LTV:CAC" 
            value={formatMultiple(deal.ltv_cac_ratio)}
            variant={isHealthyLTVCAC ? 'success' : 'default'}
            subtitle={isHealthyLTVCAC ? '✓ Healthy (≥3x)' : undefined}
          />
        </div>
      </div>

      {/* Charts Row 1: Margins & Unit Economics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Margins Breakdown */}
        {marginData.length > 0 && (
          <Card className="bg-white/5 border-white/10 p-6">
            <h4 className="text-sm font-semibold text-white/90 mb-4 flex items-center gap-2">
              <PieChartIcon className="w-4 h-4" />
              Margin Breakdown
            </h4>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={marginData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({name, value}) => `${name}: ${value.toFixed(1)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {marginData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(0,0,0,0.9)', 
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px'
                  }}
                  labelStyle={{ color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        )}

        {/* Unit Economics */}
        {unitEconomicsData.length > 0 && (
          <Card className="bg-white/5 border-white/10 p-6">
            <h4 className="text-sm font-semibold text-white/90 mb-4">Unit Economics</h4>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={unitEconomicsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.6)" />
                <YAxis stroke="rgba(255,255,255,0.6)" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(0,0,0,0.9)', 
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px'
                  }}
                  formatter={(value: any) => formatCurrency(value)}
                />
                <Bar dataKey="value" fill={COLORS.primary} radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        )}
      </div>

      {/* Charts Row 2: Retention & Rule of 40 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Retention Metrics */}
        {retentionData.length > 0 && (
          <Card className="bg-white/5 border-white/10 p-6">
            <h4 className="text-sm font-semibold text-white/90 mb-4">Retention Metrics</h4>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={retentionData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis type="number" stroke="rgba(255,255,255,0.6)" domain={[0, 120]} />
                <YAxis dataKey="name" type="category" stroke="rgba(255,255,255,0.6)" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(0,0,0,0.9)', 
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px'
                  }}
                  formatter={(value: any) => `${value.toFixed(1)}%`}
                />
                <Bar dataKey="value" fill={COLORS.success} radius={[0, 8, 8, 0]} />
                <Bar dataKey="target" fill="rgba(255,255,255,0.1)" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        )}

        {/* Rule of 40 Gauge */}
        {ruleOf40Data.length > 0 && (
          <Card className="bg-white/5 border-white/10 p-6">
            <h4 className="text-sm font-semibold text-white/90 mb-4">Rule of 40 Score</h4>
            <ResponsiveContainer width="100%" height={250}>
              <RadialBarChart 
                cx="50%" 
                cy="50%" 
                innerRadius="60%" 
                outerRadius="100%" 
                data={ruleOf40Data}
                startAngle={180}
                endAngle={0}
              >
                <RadialBar
                  background
                  dataKey="value"
                  cornerRadius={10}
                />
                <text 
                  x="50%" 
                  y="50%" 
                  textAnchor="middle" 
                  dominantBaseline="middle"
                  className="text-4xl font-bold fill-white"
                >
                  {ruleOf40Score?.toFixed(0)}
                </text>
                <text 
                  x="50%" 
                  y="60%" 
                  textAnchor="middle" 
                  dominantBaseline="middle"
                  className="text-sm fill-white/60"
                >
                  {isHealthyRuleOf40 ? '✓ Healthy' : '⚠ Below Target'}
                </text>
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="text-center mt-4 text-xs text-white/60">
              Growth ({formatPercent(deal.arr_growth_rate)}) + EBITDA Margin ({formatPercent(deal.ebitda_margin)})
            </div>
          </Card>
        )}
      </div>

      {/* Health Score Dashboard */}
      {healthScoreData.length > 0 && (
        <Card className="bg-white/5 border-white/10 p-6">
          <h4 className="text-sm font-semibold text-white/90 mb-4">Health Score Dashboard</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={healthScoreData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="metric" stroke="rgba(255,255,255,0.6)" />
              <YAxis stroke="rgba(255,255,255,0.6)" domain={[0, 120]} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(0,0,0,0.9)', 
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px'
                }}
                formatter={(value: any, name: string) => {
                  if (name === 'score' || name === 'actual') return `${value.toFixed(1)}%`
                  return value
                }}
              />
              <Legend />
              <Bar dataKey="score" fill={COLORS.primary} radius={[8, 8, 0, 0]} name="Current" />
              <Bar dataKey="target" fill="rgba(255,255,255,0.2)" radius={[8, 8, 0, 0]} name="Target" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Cash Flow Visualization */}
      {cashFlowData.length > 0 && (
        <Card className="bg-white/5 border-white/10 p-6">
          <h4 className="text-sm font-semibold text-white/90 mb-4">Cash Position</h4>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={cashFlowData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="name" stroke="rgba(255,255,255,0.6)" />
                  <YAxis stroke="rgba(255,255,255,0.6)" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(0,0,0,0.9)', 
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px'
                    }}
                    formatter={(value: any) => formatCurrency(value)}
                  />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                    {cashFlowData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-col justify-center space-y-4">
              <div>
                <p className="text-sm text-white/60 mb-1">Current Runway</p>
                <p className="text-3xl font-bold text-white">
                  {deal.runway_months ? `${deal.runway_months.toFixed(0)} mo` : 'N/A'}
                </p>
                {isHealthyRunway && (
                  <Badge variant="outline" className="mt-2 bg-green-950/50 text-green-300 border-green-800">
                    ✓ Healthy Runway
                  </Badge>
                )}
              </div>
              {deal.total_funding && (
                <div>
                  <p className="text-sm text-white/60 mb-1">Total Funding</p>
                  <p className="text-xl font-semibold text-white">
                    {formatCurrency(deal.total_funding)}
                  </p>
                </div>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Quick Health Check */}
      {(isHealthyLTVCAC || isHealthyNRR || isHealthyRuleOf40 || isHealthyRunway) && (
        <Card className="p-4 bg-green-950/20 border-green-900/50">
          <h4 className="text-sm font-semibold text-green-400 mb-2 flex items-center gap-2">
            <Check className="w-4 h-4" />
            Positive Indicators
          </h4>
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

