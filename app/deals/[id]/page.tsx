'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { supabase, type Deal } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import {
  ArrowLeft,
  Briefcase,
  FileText,
  Upload,
  Loader2,
  MessageSquare,
  Plus,
  Check,
  X,
  Send,
  Bot,
  User,
} from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

type DealFile = {
  id: string
  deal_id: string
  file_name: string
  public_url: string
  created_at: string
}

type CallTranscript = {
  id: string
  deal_id: string
  transcript_text: string
  call_date: string
  call_title: string | null
  extracted_data: any
  extraction_status: 'pending' | 'extracted' | 'approved' | 'rejected'
  created_at: string
  updated_at: string
}

type ExtractedUpdate = {
  id: string
  deal_id: string
  transcript_id: string
  field_name: string
  old_value: string | null
  new_value: string
  confidence_score: number
  approval_status: 'pending' | 'approved' | 'rejected'
  created_at: string
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

export default function DealDetailPage() {
  const router = useRouter()
  const params = useParams()
  const dealId = params.id as string

  const [deal, setDeal] = useState<Deal | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dealFiles, setDealFiles] = useState<DealFile[]>([])
  const [callTranscripts, setCallTranscripts] = useState<CallTranscript[]>([])
  const [extractedUpdates, setExtractedUpdates] = useState<ExtractedUpdate[]>([])
  const [uploadingFiles, setUploadingFiles] = useState(false)
  const [showTranscriptModal, setShowTranscriptModal] = useState(false)
  const [transcriptText, setTranscriptText] = useState('')
  const [transcriptTitle, setTranscriptTitle] = useState('')
  const [extractingTranscript, setExtractingTranscript] = useState(false)
  const [extractionResults, setExtractionResults] = useState<any>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  // Deal Lab Chat state
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const chatScrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const loadDeal = async () => {
      try {
        const { data: userData } = await supabase.auth.getUser()
        if (!userData.user) {
          router.replace('/chat')
          return
        }

        const { data: dealData, error: dealError } = await supabase
          .from('deals')
          .select('*')
          .eq('id', dealId)
          .single()

        if (dealError) throw dealError
        setDeal(dealData as Deal)

        // Load files
        const { data: files, error: filesError } = await supabase
          .from('deal_files')
          .select('*')
          .eq('deal_id', dealId)
          .order('created_at', { ascending: false })

        if (!filesError) {
          setDealFiles((files || []) as DealFile[])
        }

        // Load call transcripts
        const { data: transcripts, error: transcriptsError } = await supabase
          .from('call_transcripts')
          .select('*')
          .eq('deal_id', dealId)
          .order('call_date', { ascending: false })

        if (!transcriptsError) {
          setCallTranscripts(transcripts || [])
        }

        // Load pending extracted updates
        const { data: updates, error: updatesError } = await supabase
          .from('extracted_deal_updates')
          .select('*')
          .eq('deal_id', dealId)
          .eq('approval_status', 'pending')
          .order('created_at', { ascending: false })

        if (!updatesError) {
          setExtractedUpdates(updates || [])
        }
      } catch (err: any) {
        console.error('Failed to load deal:', err)
        setError(err.message ?? 'Failed to load deal')
      } finally {
        setLoading(false)
      }
    }

    if (dealId) {
      loadDeal()
    }
  }, [dealId, router])

  const handleDealFilesUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    dealId: string
  ) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    setUploadingFiles(true)
    try {
      const uploads: DealFile[] = []

      for (const file of Array.from(files)) {
        const filePath = `${dealId}/${Date.now()}_${file.name}`

        const { error: uploadError } = await supabase.storage
          .from('deal-files')
          .upload(filePath, file)

        if (uploadError) {
          console.error('File upload failed:', uploadError)
          alert('Upload failed. Please ensure a public storage bucket named "deal-files" exists in Supabase.')
          setUploadingFiles(false)
          return
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from('deal-files').getPublicUrl(filePath)

        const { data, error: insertError } = await supabase
          .from('deal_files')
          .insert({
            deal_id: dealId,
            file_name: file.name,
            public_url: publicUrl,
            storage_path: filePath,
          })
          .select()
          .single()

        if (insertError) throw insertError
        uploads.push(data as DealFile)
      }

      setDealFiles(prev => [...uploads, ...prev])
    } catch (error) {
      console.error('Failed to upload deal files:', error)
      alert('Failed to upload one or more files. Please try again.')
    } finally {
      setUploadingFiles(false)
      if (event.target) {
        event.target.value = ''
      }
    }
  }

  const handleAddTranscript = async () => {
    if (!deal?.id || !transcriptText.trim()) return

    setExtractingTranscript(true)
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !user) {
        throw userError || new Error('You must be signed in to add transcripts.')
      }

      const { data: transcript, error: transcriptError } = await supabase
        .from('call_transcripts')
        .insert([{
          deal_id: deal.id,
          user_id: user.id,
          transcript_text: transcriptText,
          call_title: transcriptTitle || `Call ${new Date().toLocaleDateString()}`,
          call_date: new Date().toISOString(),
          extraction_status: 'pending'
        }])
        .select()
        .single()

      if (transcriptError) throw transcriptError

      const res = await fetch('/api/extract-transcript', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: transcriptText,
          dealId: deal.id,
          transcriptId: transcript.id,
          currentDealData: deal
        }),
      })

      const extractionData = await res.json()
      if (extractionData.error) throw new Error(extractionData.error)

      const { data: updatedTranscripts } = await supabase
        .from('call_transcripts')
        .select('*')
        .eq('deal_id', deal.id)
        .order('call_date', { ascending: false })

      if (updatedTranscripts) {
        setCallTranscripts(updatedTranscripts)
      }

      const { data: updates } = await supabase
        .from('extracted_deal_updates')
        .select('*')
        .eq('deal_id', deal.id)
        .eq('approval_status', 'pending')
        .order('created_at', { ascending: false })

      if (updates) {
        setExtractedUpdates(updates)
      }

      setExtractionResults(extractionData)

      if (extractionData.updates && extractionData.updates.length > 0) {
        // Keep modal open to show results
      } else {
        setShowTranscriptModal(false)
        setTranscriptText('')
        setTranscriptTitle('')
        setExtractionResults(null)
      }
    } catch (error: any) {
      console.error('Failed to add transcript:', error)
      alert('Failed to process transcript: ' + error.message)
    } finally {
      setExtractingTranscript(false)
    }
  }

  const handleApproveExtraction = async (updateId: string, fieldName: string, newValue: string) => {
    try {
      const { error: updateError } = await supabase
        .from('extracted_deal_updates')
        .update({ approval_status: 'approved' })
        .eq('id', updateId)

      if (updateError) throw updateError

      const updateData: any = { [fieldName]: newValue }
      const { error: dealError } = await supabase
        .from('deals')
        .update(updateData)
        .eq('id', deal!.id)

      if (dealError) throw dealError

      setDeal((prev: any) => ({ ...prev, [fieldName]: newValue }))
      setExtractedUpdates(prev => prev.filter(u => u.id !== updateId))

      const transcript = callTranscripts.find(t => 
        extractedUpdates.find(u => u.transcript_id === t.id && u.id === updateId)
      )
      if (transcript) {
        const { error: transcriptError } = await supabase
          .from('call_transcripts')
          .update({ extraction_status: 'approved' })
          .eq('id', transcript.id)

        if (!transcriptError) {
          setCallTranscripts(prev => prev.map(t => 
            t.id === transcript.id ? { ...t, extraction_status: 'approved' } : t
          ))
        }
      }
    } catch (error) {
      console.error('Failed to approve extraction:', error)
      alert('Failed to approve update')
    }
  }

  const handleRejectExtraction = async (updateId: string) => {
    try {
      const { error } = await supabase
        .from('extracted_deal_updates')
        .update({ approval_status: 'rejected' })
        .eq('id', updateId)

      if (error) throw error
      setExtractedUpdates(prev => prev.filter(u => u.id !== updateId))
    } catch (error) {
      console.error('Failed to reject extraction:', error)
    }
  }

  const handleChatSubmit = async () => {
    if (!chatInput.trim() || chatLoading || !deal) return

    const userMessage = { role: 'user' as const, content: chatInput.trim() }
    setChatMessages(prev => [...prev, userMessage])
    setChatInput('')
    setChatLoading(true)

    try {
      const res = await fetch('/api/deal-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.content,
          dealId: deal.id,
          conversationHistory: chatMessages,
        }),
      })

      const data = await res.json()
      if (data.error) throw new Error(data.error)

      const assistantMessage = { role: 'assistant' as const, content: data.response }
      setChatMessages(prev => [...prev, assistantMessage])
    } catch (error: any) {
      console.error('Failed to send chat message:', error)
      const errorMessage = { role: 'assistant' as const, content: `Error: ${error.message}` }
      setChatMessages(prev => [...prev, errorMessage])
    } finally {
      setChatLoading(false)
    }
  }

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [chatMessages])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white">
        <div className="text-sm text-white/60">Loading deal…</div>
      </div>
    )
  }

  if (error || !deal) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-black text-white">
        <p className="text-red-400 mb-4">{error || 'Deal not found'}</p>
        <Button asChild className="bg-white text-black hover:bg-white/90">
          <Link href="/deals">Back to CRM</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-black text-white overflow-hidden">
      {/* Left Side - Deal Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="border-b border-white/10 bg-black/95 backdrop-blur-sm shrink-0 z-30">
          <div className="px-6 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="text-white/60 hover:text-white hover:bg-white/10"
                >
                  <Link href="/deals">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to CRM
                  </Link>
                </Button>
                <span className="text-white/40">|</span>
                <h1 className="text-lg font-semibold text-white">
                  {deal.company_name || 'Deal Details'}
                </h1>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="text-white/60 hover:text-white hover:bg-white/10"
                >
                  <Link href="/chat">Chatbot</Link>
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content - Scrollable */}
        <main className="flex-1 overflow-y-auto px-6 py-6">
          {/* Deal Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-white mb-2">
                {deal.company_name || 'Untitled Company'}
              </h2>
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="border-white/30 text-white/90 bg-white/10 text-xs px-2.5 py-1">
                  {deal.deal_name || 'Unnamed Deal'}
                </Badge>
                {deal.sector && (
                  <Badge variant="outline" className="border-white/30 text-white/90 bg-white/10 text-xs px-2.5 py-1">
                    {deal.sector}
                  </Badge>
                )}
                <Badge
                  variant={deal.status === 'closed_lost' ? 'destructive' : 'default'}
                  className={`text-xs px-2.5 py-1 ${
                    deal.status === 'closed_lost'
                      ? 'bg-red-500/80 text-white'
                      : deal.status === 'closed_won'
                      ? 'bg-emerald-500/80 text-white'
                      : 'bg-white/20 text-white border-white/30'
                  }`}
                >
                  {deal.status?.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) || 'N/A'}
                </Badge>
              </div>
            </div>
          </div>

          {/* Financial Metrics */}
          <Card className="bg-white/5 border-white/10 p-6">
            <h3 className="text-sm font-semibold text-white/90 uppercase tracking-wide mb-4 flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Financial Metrics
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <div>
                <p className="text-xs text-white/50 uppercase tracking-wide mb-2">Revenue</p>
                <p className="text-2xl font-bold text-white font-mono">
                  {deal.revenue ? formatCurrency(deal.revenue) : <span className="text-white/40">N/A</span>}
                </p>
              </div>
              <div>
                <p className="text-xs text-white/50 uppercase tracking-wide mb-2">Valuation Ask</p>
                <p className="text-2xl font-bold text-white font-mono">
                  {deal.valuation_ask ? formatCurrency(deal.valuation_ask) : <span className="text-white/40">N/A</span>}
                </p>
              </div>
              {deal.ebitda && (
                <div>
                  <p className="text-xs text-white/50 uppercase tracking-wide mb-2">EBITDA</p>
                  <p className="text-xl font-semibold text-white font-mono">
                    {formatCurrency(deal.ebitda)}
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Deal Information */}
        <Card className="bg-white/5 border-white/10 p-6 mb-6">
          <h3 className="text-sm font-semibold text-white/90 uppercase tracking-wide mb-4">Deal Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-white/50 uppercase tracking-wide mb-1.5">Geography</p>
              <p className="text-sm text-white">{deal.geography || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-white/50 uppercase tracking-wide mb-1.5">Analyst Owner</p>
              <p className="text-sm text-white font-medium">{deal.analyst_owner || 'Unassigned'}</p>
            </div>
          </div>
        </Card>

        {/* Analyst Notes */}
        <div className="space-y-5 mb-6">
          <h3 className="text-sm font-semibold text-white/90 uppercase tracking-wide flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Analyst Notes
          </h3>

          <Card className="bg-white/5 border-white/10 p-5">
            <label className="text-xs text-white/70 uppercase tracking-wide mb-2 block">
              Executive Summary
            </label>
            <Textarea
              defaultValue={deal.executive_summary || ''}
              onBlur={async (e: React.FocusEvent<HTMLTextAreaElement>) => {
                const value = e.target.value
                if (value !== deal.executive_summary) {
                  try {
                    await supabase
                      .from('deals')
                      .update({ executive_summary: value })
                      .eq('id', deal.id)
                    setDeal({
                      ...deal,
                      executive_summary: value,
                    })
                  } catch (error) {
                    console.error('Failed to update executive summary', error)
                  }
                }
              }}
              className="min-h-[140px] bg-white/5 border-white/20 text-sm text-white placeholder:text-white/40 focus:border-white/40"
              placeholder="Add a concise investment thesis, key highlights, or context for this deal..."
            />
          </Card>

          <Card className="bg-white/5 border-white/10 p-5">
            <label className="text-xs text-white/70 uppercase tracking-wide mb-2 block">
              Key Risks
            </label>
            <Textarea
              defaultValue={deal.key_risks || ''}
              onBlur={async (e: React.FocusEvent<HTMLTextAreaElement>) => {
                const value = e.target.value
                if (value !== deal.key_risks) {
                  try {
                    await supabase
                      .from('deals')
                      .update({ key_risks: value })
                      .eq('id', deal.id)
                    setDeal({
                      ...deal,
                      key_risks: value,
                    })
                  } catch (error) {
                    console.error('Failed to update key risks', error)
                  }
                }
              }}
              className="min-h-[140px] bg-white/5 border-white/20 text-sm text-white placeholder:text-white/40 focus:border-white/40"
              placeholder="Capture major concerns, red flags, or diligence focus areas..."
            />
          </Card>

          <Card className="bg-white/5 border-white/10 p-5">
            <label className="text-xs text-white/70 uppercase tracking-wide mb-2 block">
              Call / Conversation Notes
            </label>
            <Textarea
              defaultValue={deal.meeting_notes || ''}
              onBlur={async (e: React.FocusEvent<HTMLTextAreaElement>) => {
                const value = e.target.value
                if (value !== deal.meeting_notes) {
                  try {
                    await supabase
                      .from('deals')
                      .update({ meeting_notes: value })
                      .eq('id', deal.id)
                    setDeal({
                      ...deal,
                      meeting_notes: value,
                    })
                  } catch (error) {
                    console.error('Failed to update meeting notes', error)
                  }
                }
              }}
              className="min-h-[160px] bg-white/5 border-white/20 text-sm text-white placeholder:text-white/40 focus:border-white/40"
              placeholder="Paste call transcripts or jot down key conversation points, commitments, and follow-ups..."
            />
          </Card>
        </div>

        {/* Call Transcripts */}
        <Card className="bg-white/5 border-white/10 p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white/90 uppercase tracking-wide flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Call Transcripts
            </h3>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowTranscriptModal(true)}
              className="h-8 px-4 text-xs border-white/30 text-white hover:bg-white/10 bg-white/5"
            >
              <Plus className="h-3.5 w-3.5 mr-2" />
              Add Transcript
            </Button>
          </div>

          {extractedUpdates.length > 0 && (
            <div className="mb-4 space-y-3">
              <p className="text-xs text-white/60 font-medium">Pending Approvals</p>
              {extractedUpdates.map((update) => (
                <div
                  key={update.id}
                  className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-xs text-white/70 uppercase tracking-wide mb-1">
                        {update.field_name.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                      </p>
                      <div className="flex items-center gap-3 text-sm">
                        <span className="text-white/50 line-through">
                          {update.old_value || 'N/A'}
                        </span>
                        <span className="text-white/50">→</span>
                        <span className="text-white font-semibold">
                          {update.new_value}
                        </span>
                      </div>
                      <p className="text-xs text-white/50 mt-1">
                        Confidence: {Math.round(update.confidence_score * 100)}%
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleApproveExtraction(update.id, update.field_name, update.new_value)}
                        className="h-7 px-3 text-xs bg-emerald-500/80 text-white hover:bg-emerald-500"
                      >
                        <Check className="h-3 w-3 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRejectExtraction(update.id)}
                        className="h-7 px-3 text-xs border-red-500/50 text-red-400 hover:bg-red-500/10"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {callTranscripts.length === 0 ? (
            <div className="text-center py-6 border border-dashed border-white/20 rounded-lg bg-white/5">
              <MessageSquare className="h-8 w-8 text-white/30 mx-auto mb-2" />
              <p className="text-xs text-white/50">No call transcripts yet</p>
              <p className="text-xs text-white/40 mt-1">Add transcripts to extract key information automatically</p>
            </div>
          ) : (
            <div className="space-y-2">
              {callTranscripts.map((transcript) => (
                <div
                  key={transcript.id}
                  className="rounded-lg border border-white/10 bg-white/5 p-4 hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-sm font-medium text-white">
                        {transcript.call_title || `Call ${new Date(transcript.call_date).toLocaleDateString()}`}
                      </p>
                      <p className="text-xs text-white/50 mt-0.5">
                        {new Date(transcript.call_date).toLocaleDateString()} at {new Date(transcript.call_date).toLocaleTimeString()}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className={`text-xs ${
                        transcript.extraction_status === 'approved'
                          ? 'border-emerald-500/50 text-emerald-400'
                          : transcript.extraction_status === 'extracted'
                          ? 'border-amber-500/50 text-amber-400'
                          : 'border-white/30 text-white/60'
                      }`}
                    >
                      {transcript.extraction_status}
                    </Badge>
                  </div>
                  <p className="text-xs text-white/70 line-clamp-2">
                    {transcript.transcript_text.slice(0, 150)}...
                  </p>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Files & Documents */}
        <Card className="bg-white/5 border-white/10 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white/90 uppercase tracking-wide flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Files & Documents
            </h3>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={(e) => {
                if (deal?.id) {
                  handleDealFilesUpload(e, deal.id)
                }
              }}
            />
            <Button
              size="sm"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingFiles || !deal?.id}
              className="h-8 px-4 text-xs border-white/30 text-white hover:bg-white/10 bg-white/5"
            >
              {uploadingFiles ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-3.5 w-3.5 mr-2" />
                  Upload Files
                </>
              )}
            </Button>
          </div>

          {dealFiles.length === 0 ? (
            <div className="text-center py-8 border border-dashed border-white/20 rounded-lg bg-white/5">
              <FileText className="h-8 w-8 text-white/30 mx-auto mb-2" />
              <p className="text-xs text-white/50">
                No files attached yet
              </p>
              <p className="text-xs text-white/40 mt-1">
                Upload IC decks, financials, call recordings, or transcripts
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {dealFiles.map(file => (
                <a
                  key={file.id}
                  href={file.public_url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80 hover:bg-white/10 hover:border-white/20 transition-colors group"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <FileText className="h-4 w-4 text-white/50 shrink-0" />
                    <span className="truncate font-medium">{file.file_name}</span>
                  </div>
                  <span className="text-xs text-white/40 shrink-0 ml-3">
                    {new Date(file.created_at).toLocaleDateString()}
                  </span>
                </a>
              ))}
            </div>
          )}
        </Card>
        </main>
      </div>

      {/* Right Side - Deal Lab Chat (Fixed Column) */}
      <div className="w-96 border-l border-white/10 bg-black flex flex-col shrink-0">
        {/* Chat Header */}
        <div className="border-b border-white/10 px-4 py-3 shrink-0">
          <div className="flex items-center gap-2 mb-1">
            <Bot className="h-5 w-5 text-blue-400" />
            <h3 className="text-sm font-semibold text-white">Deal Lab AI</h3>
            <span className="ml-auto text-xs text-white/50 font-medium truncate max-w-[140px]">
              {deal.company_name || 'Unknown Company'}
            </span>
          </div>
          <p className="text-xs text-white/50">
            Senior PE analyst • Financial modeling & risk assessment
          </p>
        </div>

        {/* Chat Messages - Scrollable */}
        <div className="flex-1 overflow-y-auto p-4">
          {chatMessages.length === 0 ? (
            <div className="text-center py-8 text-white/40">
              <MessageSquare className="h-8 w-8 mx-auto mb-3 opacity-50" />
              <p className="text-xs mb-4">Start asking questions about this deal</p>
              <div className="space-y-2">
                <button
                  onClick={() => setChatInput('Analyze the valuation - is this attractive relative to the revenue and EBITDA?')}
                  className="w-full text-xs px-3 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-white/70 text-left"
                >
                  Valuation analysis
                </button>
                <button
                  onClick={() => setChatInput('What are the top 3 risks and red flags I should be concerned about?')}
                  className="w-full text-xs px-3 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-white/70 text-left"
                >
                  Key risks & red flags
                </button>
                <button
                  onClick={() => setChatInput('Based on the transcripts and notes, what is your investment thesis and recommendation?')}
                  className="w-full text-xs px-3 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-white/70 text-left"
                >
                  Investment thesis
                </button>
                <button
                  onClick={() => setChatInput('What critical information is missing from our diligence?')}
                  className="w-full text-xs px-3 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-white/70 text-left"
                >
                  Diligence gaps
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'assistant' && (
                    <Avatar className="h-7 w-7 border border-blue-500/30 shrink-0">
                      <AvatarFallback className="bg-blue-500/20 text-blue-400 text-[10px]">
                        AI
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={`max-w-[85%] rounded-lg px-3 py-2 text-xs ${
                      msg.role === 'user'
                        ? 'bg-white text-black'
                        : 'bg-white/10 text-white border border-white/10'
                    }`}
                  >
                    <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                  </div>
                  {msg.role === 'user' && (
                    <Avatar className="h-7 w-7 border border-white/20 shrink-0">
                      <AvatarFallback className="bg-white/20 text-white text-[10px]">
                        U
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
              {chatLoading && (
                <div className="flex gap-2 justify-start">
                  <Avatar className="h-7 w-7 border border-blue-500/30 shrink-0">
                    <AvatarFallback className="bg-blue-500/20 text-blue-400 text-[10px]">
                      AI
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-white/10 border border-white/10 rounded-lg px-3 py-2">
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-white/60" />
                  </div>
                </div>
              )}
              <div ref={chatScrollRef} />
            </div>
          )}
        </div>

        {/* Chat Input - Fixed at Bottom */}
        <div className="border-t border-white/10 p-3 shrink-0">
          <div className="flex gap-2">
            <Input
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleChatSubmit()
                }
              }}
              placeholder="Ask a question..."
              disabled={chatLoading}
              className="flex-1 h-9 text-xs bg-white/5 border-white/20 text-white placeholder:text-white/40"
            />
            <Button
              onClick={handleChatSubmit}
              disabled={chatLoading || !chatInput.trim()}
              size="sm"
              className="h-9 px-3 bg-blue-500 hover:bg-blue-600 text-white"
            >
              {chatLoading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Send className="h-3.5 w-3.5" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Transcript Modal */}
      <Dialog open={showTranscriptModal} onOpenChange={setShowTranscriptModal}>
        <DialogContent className="bg-black border-white/20 text-white max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Add Call Transcript</DialogTitle>
            <DialogDescription className="text-white/60">
              Paste the call transcript below. AI will automatically extract key information like pricing changes, status updates, and metrics.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium text-white/90 mb-2 block">
                Call Title (optional)
              </label>
              <Input
                value={transcriptTitle}
                onChange={(e) => setTranscriptTitle(e.target.value)}
                placeholder="e.g., Initial Discovery Call, Follow-up #2"
                className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-white/90 mb-2 block">
                Transcript
              </label>
              <Textarea
                value={transcriptText}
                onChange={(e) => setTranscriptText(e.target.value)}
                placeholder="Paste the full call transcript here..."
                className="min-h-[300px] bg-white/5 border-white/20 text-white placeholder:text-white/40 font-mono text-sm"
              />
            </div>

            {extractionResults && extractionResults.updates && extractionResults.updates.length > 0 && (
              <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 space-y-3">
                <p className="text-sm font-semibold text-white">Extracted Information</p>
                {extractionResults.updates.map((update: any, idx: number) => (
                  <div key={idx} className="bg-white/5 rounded p-3">
                    <p className="text-xs text-white/70 uppercase tracking-wide mb-1">
                      {update.field_name.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                    </p>
                    <div className="flex items-center gap-3 text-sm">
                      <span className="text-white/50 line-through">
                        {update.old_value || 'N/A'}
                      </span>
                      <span className="text-white/50">→</span>
                      <span className="text-white font-semibold">
                        {update.new_value}
                      </span>
                    </div>
                    <p className="text-xs text-white/50 mt-1">
                      Confidence: {Math.round(update.confidence_score * 100)}% • {update.reasoning}
                    </p>
                  </div>
                ))}
                <p className="text-xs text-white/60 mt-2">
                  Review and approve these changes above.
                </p>
              </div>
            )}
          </div>

          <DialogFooter className="gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowTranscriptModal(false)
                setTranscriptText('')
                setTranscriptTitle('')
                setExtractionResults(null)
              }}
              className="border-white/40 bg-white/5 text-white text-sm font-medium hover:bg-white/15 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleAddTranscript}
              disabled={!transcriptText.trim() || extractingTranscript}
              className="bg-emerald-400 text-black text-sm font-semibold hover:bg-emerald-300 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {extractingTranscript ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Extracting…
                </>
              ) : (
                <>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Process Transcript
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

