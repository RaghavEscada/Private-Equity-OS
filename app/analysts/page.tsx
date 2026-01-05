'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase, type Deal } from '@/lib/supabase'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Search, TrendingUp, TrendingDown, DollarSign, Users, BarChart3, ArrowRight } from 'lucide-react'
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
} from 'recharts'

type AnalystMetrics = {
  analyst_name: string
  total_deals: number
  total_arr: number
  avg_arr_growth: number
  avg_gross_margin: number
  avg_ebitda_margin: number
  avg_ltv_cac: number
  avg_net_retention: number
  avg_rule_of_40: number
  total_valuation: number
  deals: Deal[]
}

function formatCurrency(value?: number): string {
  if (value === null || value === undefined || isNaN(value)) return '—'
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`
  return `$${value.toFixed(0)}`
}

function formatPercent(value?: number): string {
  if (value === null || value === undefined || isNaN(value)) return '—'
  return `${value.toFixed(1)}%`
}

export default function AnalystsPage() {
  const router = useRouter()
  const [deals, setDeals] = useState<Deal[]>([])
  const [analystMetrics, setAnalystMetrics] = useState<AnalystMetrics[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [selectedAnalyst, setSelectedAnalyst] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const { data: userData } = await supabase.auth.getUser()
        if (!userData.user) {
          router.replace('/chat')
          return
        }

        const { data, error } = await supabase
          .from('deals')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) throw error
        setDeals((data || []) as any)
      } catch (err: any) {
        console.error('Failed to load deals:', err)
        setError(err.message ?? 'Failed to load deals')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [router])

  useEffect(() => {
    if (deals.length === 0) return

    // Group deals by analyst
    const grouped = deals.reduce((acc, deal) => {
      const analyst = deal.analyst_owner || 'Unassigned'
      if (!acc[analyst]) {
        acc[analyst] = []
      }
      acc[analyst].push(deal)
      return acc
    }, {} as Record<string, Deal[]>)

    // Calculate metrics per analyst
    const metrics: AnalystMetrics[] = Object.entries(grouped).map(([analyst_name, deals]) => {
      const validDeals = deals.filter(d => d.analyst_owner === analyst_name)
      
      // Calculate aggregates
      const total_arr = validDeals.reduce((sum, d) => sum + (d.arr || d.mrr ? (d.arr || (d.mrr || 0) * 12) : 0), 0)
      const total_valuation = validDeals.reduce((sum, d) => sum + (d.valuation_ask || 0), 0)
      
      // Calculate averages (only for deals with data)
      const arrGrowthDeals = validDeals.filter(d => d.arr_growth_rate != null)
      const avg_arr_growth = arrGrowthDeals.length > 0
        ? arrGrowthDeals.reduce((sum, d) => sum + (d.arr_growth_rate || 0), 0) / arrGrowthDeals.length
        : 0

      const grossMarginDeals = validDeals.filter(d => d.gross_margin != null)
      const avg_gross_margin = grossMarginDeals.length > 0
        ? grossMarginDeals.reduce((sum, d) => sum + (d.gross_margin || 0), 0) / grossMarginDeals.length
        : 0

      const ebitdaMarginDeals = validDeals.filter(d => d.ebitda_margin != null)
      const avg_ebitda_margin = ebitdaMarginDeals.length > 0
        ? ebitdaMarginDeals.reduce((sum, d) => sum + (d.ebitda_margin || 0), 0) / ebitdaMarginDeals.length
        : 0

      const ltvCacDeals = validDeals.filter(d => d.ltv_cac_ratio != null)
      const avg_ltv_cac = ltvCacDeals.length > 0
        ? ltvCacDeals.reduce((sum, d) => sum + (d.ltv_cac_ratio || 0), 0) / ltvCacDeals.length
        : 0

      const netRetentionDeals = validDeals.filter(d => d.net_revenue_retention != null)
      const avg_net_retention = netRetentionDeals.length > 0
        ? netRetentionDeals.reduce((sum, d) => sum + (d.net_revenue_retention || 0), 0) / netRetentionDeals.length
        : 0

      const ruleOf40Deals = validDeals.filter(d => d.rule_of_40 != null)
      const avg_rule_of_40 = ruleOf40Deals.length > 0
        ? ruleOf40Deals.reduce((sum, d) => sum + (d.rule_of_40 || 0), 0) / ruleOf40Deals.length
        : 0

      return {
        analyst_name,
        total_deals: validDeals.length,
        total_arr,
        avg_arr_growth,
        avg_gross_margin,
        avg_ebitda_margin,
        avg_ltv_cac,
        avg_net_retention,
        avg_rule_of_40,
        total_valuation,
        deals: validDeals,
      }
    })

    // Sort by total deals descending
    metrics.sort((a, b) => b.total_deals - a.total_deals)
    setAnalystMetrics(metrics)
  }, [deals])

  const filteredAnalysts = analystMetrics.filter(a => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return a.analyst_name.toLowerCase().includes(q)
  })

  const selectedMetrics = selectedAnalyst
    ? analystMetrics.find(a => a.analyst_name === selectedAnalyst)
    : null

  // Chart data for selected analyst
  const chartData = selectedMetrics
    ? selectedMetrics.deals
        .filter(d => d.arr || d.mrr)
        .map(d => ({
          name: d.company_name?.substring(0, 15) || 'Unknown',
          arr: d.arr || (d.mrr || 0) * 12,
          valuation: d.valuation_ask || 0,
        }))
        .slice(0, 10)
    : []

  const statusDistribution = selectedMetrics
    ? selectedMetrics.deals.reduce((acc, deal) => {
        const status = deal.status || 'unknown'
        acc[status] = (acc[status] || 0) + 1
        return acc
      }, {} as Record<string, number>)
    : {}

  const pieData = Object.entries(statusDistribution).map(([name, value]) => ({
    name,
    value,
  }))

  const COLORS = ['#6366f1', '#22c55e', '#eab308', '#ef4444', '#8b5cf6', '#06b6d4']

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-black text-white">
        <div className="flex justify-center items-center h-screen">
          <div className="text-white/60 text-sm">Loading analyst metrics...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col bg-black text-white">
        <div className="flex justify-center items-center h-screen">
          <div className="text-red-400 text-sm">{error}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-black text-white">
      <header className="border-b border-white/10 bg-black/95 backdrop-blur-sm sticky top-0 z-30">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80">
              <span className="h-8 w-8 rounded-lg bg-white flex items-center justify-center text-black font-semibold">
                DL
              </span>
              <span className="font-semibold text-white">Analyst Performance</span>
            </Link>
            <span className="hidden text-sm text-white/60 md:inline">
              Individual analyst metrics and performance.
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search analysts..."
                className="w-56 rounded-full bg-white/5 border border-white/15 pl-9 pr-3 py-1.5 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/40"
              />
            </div>
            <Button
              size="sm"
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10"
              asChild
            >
              <Link href="/deals">Deals</Link>
            </Button>
            <Button
              size="sm"
              className="bg-white text-black font-medium hover:bg-white/90"
              asChild
            >
              <Link href="/chat">Chatbot</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-auto">
        <div className="container mx-auto px-4 py-6">
          {filteredAnalysts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center text-white/70">
              <p className="text-sm mb-2">No analysts found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Analyst List */}
              <div className="lg:col-span-1 space-y-4">
                <h2 className="text-lg font-semibold text-white mb-4">Analysts</h2>
                {filteredAnalysts.map(analyst => (
                  <Card
                    key={analyst.analyst_name}
                    className={`bg-white/5 border-white/10 p-4 cursor-pointer transition-all hover:bg-white/10 ${
                      selectedAnalyst === analyst.analyst_name ? 'ring-2 ring-blue-500' : ''
                    }`}
                    onClick={() => setSelectedAnalyst(analyst.analyst_name)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-white mb-2">{analyst.analyst_name}</h3>
                        <div className="space-y-1 text-sm">
                          <div className="flex items-center gap-2 text-white/70">
                            <Users className="h-3.5 w-3.5" />
                            <span>{analyst.total_deals} deals</span>
                          </div>
                          <div className="flex items-center gap-2 text-white/70">
                            <DollarSign className="h-3.5 w-3.5" />
                            <span>{formatCurrency(analyst.total_arr)} ARR</span>
                          </div>
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-white/40" />
                    </div>
                  </Card>
                ))}
              </div>

              {/* Analyst Details */}
              <div className="lg:col-span-2">
                {selectedAnalyst && selectedMetrics ? (
                  <div className="space-y-6">
                    {/* Header */}
                    <div>
                      <h1 className="text-2xl font-bold text-white mb-2">{selectedMetrics.analyst_name}</h1>
                      <p className="text-white/60 text-sm">
                        Performance metrics across {selectedMetrics.total_deals} deals
                      </p>
                    </div>

                    {/* Key Metrics */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <Card className="bg-white/5 border-white/10 p-4">
                        <p className="text-xs text-white/50 uppercase tracking-wide mb-1">Total Deals</p>
                        <p className="text-2xl font-bold text-white">{selectedMetrics.total_deals}</p>
                      </Card>
                      <Card className="bg-white/5 border-white/10 p-4">
                        <p className="text-xs text-white/50 uppercase tracking-wide mb-1">Total ARR</p>
                        <p className="text-2xl font-bold text-white">{formatCurrency(selectedMetrics.total_arr)}</p>
                      </Card>
                      <Card className="bg-white/5 border-white/10 p-4">
                        <p className="text-xs text-white/50 uppercase tracking-wide mb-1">Avg Growth</p>
                        <p className="text-2xl font-bold text-white">{formatPercent(selectedMetrics.avg_arr_growth)}</p>
                      </Card>
                      <Card className="bg-white/5 border-white/10 p-4">
                        <p className="text-xs text-white/50 uppercase tracking-wide mb-1">Total Valuation</p>
                        <p className="text-2xl font-bold text-white">{formatCurrency(selectedMetrics.total_valuation)}</p>
                      </Card>
                    </div>

                    {/* Financial Metrics */}
                    <Card className="bg-white/5 border-white/10 p-6">
                      <h3 className="text-sm font-semibold text-white/90 uppercase tracking-wide mb-4">
                        Financial Performance
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-xs text-white/50 uppercase tracking-wide mb-1">Avg Gross Margin</p>
                          <p className="text-xl font-semibold text-white">{formatPercent(selectedMetrics.avg_gross_margin)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-white/50 uppercase tracking-wide mb-1">Avg EBITDA Margin</p>
                          <p className="text-xl font-semibold text-white">{formatPercent(selectedMetrics.avg_ebitda_margin)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-white/50 uppercase tracking-wide mb-1">Avg LTV:CAC</p>
                          <p className="text-xl font-semibold text-white">{formatPercent(selectedMetrics.avg_ltv_cac)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-white/50 uppercase tracking-wide mb-1">Avg Net Retention</p>
                          <p className="text-xl font-semibold text-white">{formatPercent(selectedMetrics.avg_net_retention)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-white/50 uppercase tracking-wide mb-1">Avg Rule of 40</p>
                          <p className="text-xl font-semibold text-white">{formatPercent(selectedMetrics.avg_rule_of_40)}</p>
                        </div>
                      </div>
                    </Card>

                    {/* Charts */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* ARR by Deal */}
                      {chartData.length > 0 && (
                        <Card className="bg-white/5 border-white/10 p-6">
                          <h3 className="text-sm font-semibold text-white/90 uppercase tracking-wide mb-4">
                            ARR by Deal
                          </h3>
                          <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={chartData}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                              <XAxis dataKey="name" stroke="#ffffff60" fontSize={10} angle={-45} textAnchor="end" height={80} />
                              <YAxis stroke="#ffffff60" fontSize={10} />
                              <Tooltip
                                contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #ffffff20', borderRadius: '8px' }}
                                labelStyle={{ color: '#ffffff' }}
                              />
                              <Bar dataKey="arr" fill="#6366f1" radius={[4, 4, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </Card>
                      )}

                      {/* Status Distribution */}
                      {pieData.length > 0 && (
                        <Card className="bg-white/5 border-white/10 p-6">
                          <h3 className="text-sm font-semibold text-white/90 uppercase tracking-wide mb-4">
                            Deal Status Distribution
                          </h3>
                          <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                              <Pie
                                data={pieData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                              >
                                {pieData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip
                                contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #ffffff20', borderRadius: '8px' }}
                              />
                            </PieChart>
                          </ResponsiveContainer>
                        </Card>
                      )}
                    </div>

                    {/* Deal List */}
                    <Card className="bg-white/5 border-white/10 p-6">
                      <h3 className="text-sm font-semibold text-white/90 uppercase tracking-wide mb-4">
                        Deals ({selectedMetrics.deals.length})
                      </h3>
                      <div className="space-y-2">
                        {selectedMetrics.deals.map(deal => (
                          <Link
                            key={deal.id}
                            href={`/deals/${deal.id}`}
                            className="block p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium text-white">{deal.company_name || deal.deal_name}</p>
                                <p className="text-xs text-white/60 mt-1">
                                  {formatCurrency(deal.arr || (deal.mrr || 0) * 12)} ARR • {deal.status}
                                </p>
                              </div>
                              <ArrowRight className="h-4 w-4 text-white/40" />
                            </div>
                          </Link>
                        ))}
                      </div>
                    </Card>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 text-center text-white/70">
                    <BarChart3 className="h-12 w-12 text-white/30 mb-4" />
                    <p className="text-sm mb-2">Select an analyst to view performance metrics</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}







