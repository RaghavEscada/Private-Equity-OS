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
  })

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

