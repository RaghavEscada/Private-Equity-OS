'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase, type Deal } from '@/lib/supabase'
import { DealGrid } from '@/components/ui/DealChat'
import { Button } from '@/components/ui/button'
import { Search } from 'lucide-react'

export default function DealsPage() {
  const router = useRouter()
  const [deals, setDeals] = useState<Deal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')

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

  const filteredDeals = deals.filter(d => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (
      (d.company_name || '').toLowerCase().includes(q) ||
      (d.deal_name || '').toLowerCase().includes(q) ||
      (d.sector || '').toLowerCase().includes(q) ||
      (d.geography || '').toLowerCase().includes(q) ||
      (d.analyst_owner || '').toLowerCase().includes(q)
    )
  })

  return (
    <div className="flex min-h-screen flex-col bg-black text-white">
      <header className="border-b border-white/10 bg-black/95 backdrop-blur-sm sticky top-0 z-30">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80">
              <span className="h-8 w-8 rounded-lg bg-white flex items-center justify-center text-black font-semibold">
                DL
              </span>
              <span className="font-semibold text-white">Deal Lab CRM</span>
            </Link>
            <span className="hidden text-sm text-white/60 md:inline">
              Curated deal flow, at a glance.
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search deals, sectors, owners..."
                className="w-56 rounded-full bg-white/5 border border-white/15 pl-9 pr-3 py-1.5 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/40"
              />
            </div>
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
          {loading ? (
            <div className="flex justify-center py-20 text-white/60 text-sm">
              Loading deals…
            </div>
          ) : error ? (
            <div className="text-center text-red-400 py-20 text-sm">{error}</div>
          ) : filteredDeals.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center text-white/70">
              <p className="text-sm mb-2">No deals found for this filter.</p>
              <p className="text-xs text-white/40">
                Try adjusting your search or add a new deal from the Deal Lab.
              </p>
              <Button
                className="mt-4 bg-white text-black hover:bg-white/90"
                asChild
              >
                <Link href="/chat?mode=deals">Add a deal</Link>
              </Button>
            </div>
          ) : (
            <DealGrid
              deals={filteredDeals}
              onDealClick={deal => {
                router.push(`/deals/${deal.id}`)
              }}
            />
          )}
        </div>
      </main>
    </div>
  )
}


