'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Send, Loader2, Home, Trash2, Check, Circle, FileText, FileCheck, ClipboardList, Upload, Briefcase, Copy, Download, CheckCircle2, RotateCcw, Edit2, X, ThumbsUp, ThumbsDown, Search, Command, Sparkles, Plus, MessageSquare, MoreVertical } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { DealForm } from './DealForm'
import { supabase } from '@/lib/supabase'

type Message = {
  id?: string
  role: 'user' | 'assistant'
  content: string
  data?: any
  timestamp?: number
}

type DealFile = {
  id: string
  deal_id: string
  file_name: string
  public_url: string
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

export function DealTable({ deals, onDealClick }: { deals: any[]; onDealClick?: (deal: any) => void }) {
  if (!deals || deals.length === 0) return null

  const exportToCSV = () => {
    const headers = ['Company', 'Deal Name', 'Sector', 'Status', 'Geography', 'Revenue', 'Valuation', 'Owner']
    const rows = deals.map(deal => [
      deal.company_name || 'N/A',
      deal.deal_name || 'N/A',
      deal.sector || 'N/A',
      deal.status?.replace(/_/g, ' ') || 'N/A',
      deal.geography || 'N/A',
      deal.revenue ? formatCurrency(deal.revenue) : 'N/A',
      deal.valuation_ask ? formatCurrency(deal.valuation_ask) : 'N/A',
      deal.analyst_owner || 'N/A'
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `deals_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'diligence':
        return 'secondary'
      case 'nda_signed':
        return 'default'
      case 'loi_signed':
        return 'default'
      case 'ioi_sent':
        return 'default'
      case 'closed_won':
        return 'default'
      case 'closed_lost':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  const formatStatus = (status: string) => {
    return status?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'N/A'
  }

  return (
    <div className="mt-4 space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Briefcase className="h-4 w-4 text-white/70" />
          <span className="text-sm font-semibold text-white">Deal Listings</span>
          <span className="text-xs text-white/50">
            {deals.length} {deals.length === 1 ? 'deal' : 'deals'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-1 text-xs text-white/50">
            <span className="px-2 py-1 rounded-full border border-white/15 bg-white/5">Type</span>
            <span className="px-2 py-1 rounded-full border border-white/15 bg-white/5">Sector</span>
            <span className="px-2 py-1 rounded-full border border-white/15 bg-white/5">Status</span>
            <span className="px-2 py-1 rounded-full border border-white/15 bg-white/5">Owner</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={exportToCSV}
            className="h-8 text-white/70 hover:text-white hover:bg-white/10"
          >
            <Download className="h-3.5 w-3.5 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {deals.map((deal, idx) => (
          <button
            key={deal.id || idx}
            type="button"
            onClick={() => onDealClick?.(deal)}
            className="group relative text-left"
          >
            <Card className="h-full flex flex-col gap-3 rounded-2xl border border-white/10 bg-black/60 hover:border-white/40 hover:bg-white/5 transition-colors duration-200 p-5 shadow-lg">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="h-9 w-9 rounded-xl bg-emerald-500/10 text-emerald-300 flex items-center justify-center shrink-0">
                    <Briefcase className="h-4 w-4" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-white truncate max-w-[210px]">
                      {deal.company_name || 'Untitled Company'}
                    </p>
                    <p className="text-xs text-white/60 truncate max-w-[220px]">
                      {deal.deal_name || 'Deal opportunity'}
                    </p>
                  </div>
                </div>
                <Badge
                  variant={getStatusVariant(deal.status)}
                  className={`text-[11px] font-medium px-2.5 py-1 rounded-full ${
                    getStatusVariant(deal.status) === 'default'
                      ? 'bg-white text-black hover:bg-white/90'
                      : getStatusVariant(deal.status) === 'destructive'
                      ? 'bg-red-500/80 text-white'
                      : 'bg-white/10 text-white border-white/20'
                  }`}
                >
                  {formatStatus(deal.status)}
                </Badge>
              </div>

              <p className="text-xs text-white/60 line-clamp-2 min-h-[32px]">
                {deal.executive_summary ||
                  'No summary added yet. Use calls and notes to capture why this is interesting.'}
              </p>

              <div className="grid grid-cols-3 gap-3 pt-1 text-xs">
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-white/45 mb-1">
                    Revenue
                  </p>
                  <p className="font-mono text-sm text-white">
                    {deal.revenue ? formatCurrency(deal.revenue) : <span className="text-white/35">N/A</span>}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-white/45 mb-1">
                    Valuation
                  </p>
                  <p className="font-mono text-sm text-white">
                    {deal.valuation_ask ? formatCurrency(deal.valuation_ask) : <span className="text-white/35">N/A</span>}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-white/45 mb-1">
                    Sector
                  </p>
                  <p className="text-xs text-white/80 truncate">
                  {deal.sector || 'N/A'}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 text-[11px] text-white/55">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full border border-white/15 px-2 py-0.5">
                    <Circle className="h-2 w-2 text-emerald-400" />
                    <span className="truncate max-w-[110px]">
                      {deal.analyst_owner || 'Unassigned'}
                </span>
                </span>
                  {deal.geography && (
                    <span className="hidden sm:inline text-white/45 truncate max-w-[80px]">
                      {deal.geography}
                    </span>
                  )}
                </div>
                <MoreVertical className="h-3.5 w-3.5 text-white/35 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </Card>
          </button>
        ))}
      </div>
    </div>
  )
}

function SummaryCard({ summary }: { summary: any }) {
  if (!summary) return null

  return (
    <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
      <Card className="p-6 bg-white/5 border border-white/10 backdrop-blur-sm shadow-lg">
        <p className="text-sm font-medium text-white/70 mb-3">Total Deals</p>
        <p className="text-4xl font-bold text-white">{summary.total || 0}</p>
      </Card>

      <Card className="p-6 bg-white/5 border border-white/10 backdrop-blur-sm shadow-lg">
        <p className="text-sm font-medium text-white/70 mb-3">Active Deals</p>
        <p className="text-4xl font-bold text-white">{summary.active || 0}</p>
      </Card>

      <Card className="p-6 bg-white/5 border border-white/10 backdrop-blur-sm shadow-lg">
        <p className="text-sm font-medium text-white/70 mb-3">Total Value</p>
        <p className="text-3xl font-bold text-white">
          {summary.total_value ? formatCurrency(summary.total_value) : '$0'}
        </p>
      </Card>
    </div>
  )
}

const STORAGE_KEY = 'deal-lab-chat-messages'
const STORAGE_KEY_CURRENT_CHAT = 'deal-lab-current-chat-id'

type ChatSession = {
  id: string
  title: string | null
  mode: Mode
  created_at: string
  updated_at: string
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

function MessageCopyButton({ content, isUser }: { content: string; isUser?: boolean }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <button
      onClick={handleCopy}
      className={`absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded ${
        isUser 
          ? 'hover:bg-black/10' 
          : 'hover:bg-white/10'
      }`}
      title="Copy message"
    >
      {copied ? (
        <CheckCircle2 className={`h-3.5 w-3.5 ${isUser ? 'text-black/80' : 'text-white/80'}`} />
      ) : (
        <Copy className={`h-3.5 w-3.5 ${isUser ? 'text-black/60' : 'text-white/60'}`} />
      )}
    </button>
  )
}

const getDefaultMessages = (mode: Mode): Message[] => {
  // Return empty array for new chats - show empty state instead
  return []
}

type ThinkingStep = {
  id: string
  text: string
  status: 'pending' | 'active' | 'completed'
  currentAction?: string
}

type Mode = 'deals' | 'documents' | 'loi' | 'diligence'

export default function DealChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [thinkingSteps, setThinkingSteps] = useState<ThinkingStep[]>([])
  const [mode, setMode] = useState<Mode>('deals')
  const [showDealForm, setShowDealForm] = useState(false)
  const [editingMessageId, setEditingMessageId] = useState<number | null>(null)
  const [editingContent, setEditingContent] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState('')
  const [enhancing, setEnhancing] = useState(false)
  const [currentChatId, setCurrentChatId] = useState<string | null>(null)
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([])
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [selectedDeal, setSelectedDeal] = useState<any | null>(null)
  const [dealDetailOpen, setDealDetailOpen] = useState(false)
  const [dealFiles, setDealFiles] = useState<DealFile[]>([])
  const [uploadingFiles, setUploadingFiles] = useState(false)
  const [callTranscripts, setCallTranscripts] = useState<CallTranscript[]>([])
  const [extractedUpdates, setExtractedUpdates] = useState<ExtractedUpdate[]>([])
  const [showTranscriptModal, setShowTranscriptModal] = useState(false)
  const [transcriptText, setTranscriptText] = useState('')
  const [transcriptTitle, setTranscriptTitle] = useState('')
  const [extractingTranscript, setExtractingTranscript] = useState(false)
  const [extractionResults, setExtractionResults] = useState<any>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)

  const loadChatMessages = async (chatId: string) => {
    try {
      const { data: messagesData, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', chatId)
        .order('message_order', { ascending: true })

      if (error) throw error

      const formattedMessages: Message[] = (messagesData || []).map(msg => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        data: msg.data,
        timestamp: new Date(msg.created_at).getTime()
      }))

      setMessages(formattedMessages)
      localStorage.setItem(STORAGE_KEY_CURRENT_CHAT, chatId)
    } catch (error) {
      console.error('Failed to load messages:', error)
    }
  }

  const createNewChat = async () => {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !user) {
        throw userError || new Error('Not authenticated')
      }

      const { data: newChat, error } = await supabase
        .from('chat_sessions')
        .insert([{ mode, title: 'New Chat', user_id: user.id }])
        .select()
        .single()

      if (error) throw error

      setCurrentChatId(newChat.id)
      setMessages([])
      setChatSessions(prev => [newChat, ...prev])
      localStorage.setItem(STORAGE_KEY_CURRENT_CHAT, newChat.id)
    } catch (error) {
      console.error('Failed to create new chat:', error)
    }
  }

  const deleteChat = async (chatId: string) => {
    try {
      const { error } = await supabase
        .from('chat_sessions')
        .delete()
        .eq('id', chatId)

      if (error) throw error

      setChatSessions(prev => prev.filter(s => s.id !== chatId))
      
      if (currentChatId === chatId) {
        // Switch to most recent chat or create new one
        const remaining = chatSessions.filter(s => s.id !== chatId)
        if (remaining.length > 0) {
          setCurrentChatId(remaining[0].id)
          await loadChatMessages(remaining[0].id)
        } else {
          await createNewChat()
        }
      }
    } catch (error) {
      console.error('Failed to delete chat:', error)
    }
  }

  const updateChatTitle = async (chatId: string, title: string) => {
    try {
      const { error } = await supabase
        .from('chat_sessions')
        .update({ title })
        .eq('id', chatId)

      if (error) throw error

      setChatSessions(prev => prev.map(s => s.id === chatId ? { ...s, title } : s))
    } catch (error) {
      console.error('Failed to update chat title:', error)
    }
  }

  // Load chat sessions and current chat
  useEffect(() => {
    const loadChatSessions = async () => {
      try {
        // Try to load chat sessions from Supabase
        const { data: sessions, error } = await supabase
          .from('chat_sessions')
          .select('*')
          .order('updated_at', { ascending: false })
          .limit(50)

        if (error) {
          // Tables might not exist yet - fallback to localStorage
          throw error
        }

        setChatSessions(sessions || [])

        // Get current chat ID from localStorage or create new one
        const savedChatId = localStorage.getItem(STORAGE_KEY_CURRENT_CHAT)
        if (savedChatId && sessions?.find(s => s.id === savedChatId)) {
          setCurrentChatId(savedChatId)
          await loadChatMessages(savedChatId)
        } else if (sessions && sessions.length > 0) {
          // Load most recent chat
          setCurrentChatId(sessions[0].id)
          await loadChatMessages(sessions[0].id)
        } else {
          // Create new chat if tables exist
          await createNewChat()
        }
      } catch (error: any) {
        // Fallback to localStorage if Supabase tables don't exist
        try {
          const saved = localStorage.getItem(STORAGE_KEY)
          if (saved) {
            const parsed = JSON.parse(saved)
            setMessages(parsed)
          }
          // Create a dummy session for localStorage mode
          setChatSessions([{
            id: 'local-chat',
            title: 'Current Chat',
            mode: mode,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }])
          setCurrentChatId('local-chat')
        } catch (e) {
          console.error('Failed to load from localStorage:', e)
        }
      } finally {
        setIsInitialized(true)
      }
    }

    loadChatSessions()
  }, [])

  // Save messages to Supabase whenever they change
  useEffect(() => {
    if (isInitialized && currentChatId && messages.length > 0) {
      const saveMessages = async () => {
        try {
          // Check if tables exist by trying to query
          const { error: checkError } = await supabase
            .from('chat_sessions')
            .select('id')
            .eq('id', currentChatId)
            .limit(1)

          if (checkError) {
            // Tables don't exist or error - fallback to localStorage
            throw new Error('Supabase tables not available')
          }

          // Delete existing messages for this chat
          const { error: deleteError } = await supabase
            .from('chat_messages')
            .delete()
            .eq('session_id', currentChatId)

          if (deleteError) throw deleteError

          // Insert all messages
          const messagesToSave = messages.map((msg, idx) => ({
            session_id: currentChatId,
            role: msg.role,
            content: msg.content,
            data: msg.data || null,
            message_order: idx
          }))

          const { error: insertError } = await supabase
            .from('chat_messages')
            .insert(messagesToSave)

          if (insertError) throw insertError

          // Update chat title from first user message if title is still "New Chat"
          const firstUserMessage = messages.find(m => m.role === 'user')
          if (firstUserMessage) {
            const currentSession = chatSessions.find(s => s.id === currentChatId)
            if (currentSession?.title === 'New Chat' || !currentSession?.title) {
              const title = firstUserMessage.content.slice(0, 50)
              await updateChatTitle(currentChatId, title)
            }
          }
        } catch (error: any) {
          // Silently fallback to localStorage - don't show error to user
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(messages))
            localStorage.setItem(STORAGE_KEY_CURRENT_CHAT, currentChatId || '')
          } catch (e) {
            // Only log if localStorage also fails
            console.error('Failed to save messages to both Supabase and localStorage:', e)
          }
        }
      }

      // Debounce saves to avoid too many writes
      const timeoutId = setTimeout(saveMessages, 500)
      return () => clearTimeout(timeoutId)
    }
  }, [messages, currentChatId, isInitialized, chatSessions])

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Load files, transcripts, and pending extractions when deal detail view opens
  useEffect(() => {
    const loadDealContext = async () => {
      if (!dealDetailOpen || !selectedDeal?.id) {
        setDealFiles([])
        setCallTranscripts([])
        setExtractedUpdates([])
        return
      }

      try {
        // Files
        const { data: files, error: filesError } = await supabase
          .from('deal_files')
          .select('*')
          .eq('deal_id', selectedDeal.id)
          .order('created_at', { ascending: false })

        if (filesError) throw filesError
        setDealFiles((files || []) as DealFile[])

        // Call transcripts
        const { data: transcripts, error: transcriptsError } = await supabase
          .from('call_transcripts')
          .select('*')
          .eq('deal_id', selectedDeal.id)
          .order('call_date', { ascending: false })

        if (!transcriptsError) {
          setCallTranscripts(transcripts || [])
        }

        // Pending extracted updates
        const { data: updates, error: updatesError } = await supabase
          .from('extracted_deal_updates')
          .select('*')
          .eq('deal_id', selectedDeal.id)
          .eq('approval_status', 'pending')
          .order('created_at', { ascending: false })

        if (!updatesError) {
          setExtractedUpdates(updates || [])
        }
      } catch (error) {
        console.error('Failed to load deal context:', error)
      }
    }

    loadDealContext()
  }, [dealDetailOpen, selectedDeal?.id])

  const enhancePrompt = async () => {
    if (!input.trim() || enhancing) return

    setEnhancing(true)
    try {
      // Get recent conversation context (last 3 messages for context)
      const recentContext = messages.slice(-3).map(m => ({
        role: m.role,
        content: m.content
      }))

      const res = await fetch('/api/enhance-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: input,
          context: recentContext,
          mode: mode
        }),
      })

      const data = await res.json()
      if (data.error) throw new Error(data.error)

      if (data.enhanced) {
        setInput(data.enhanced)
      }
    } catch (error: any) {
      console.error('Failed to enhance prompt:', error)
      // Silently fail - don't interrupt user flow
    } finally {
      setEnhancing(false)
    }
  }

  const sendMessage = async (messageToSend?: string, regenerateIndex?: number) => {
    const messageContent = messageToSend || input.trim()
    if (!messageContent || loading) return

    const userMessage: Message = { 
      role: 'user', 
      content: messageContent,
      id: `msg-${Date.now()}`,
      timestamp: Date.now()
    }
    
    let updatedMessages: Message[]
    if (regenerateIndex !== undefined) {
      // Remove messages after the regeneration point
      updatedMessages = [...messages.slice(0, regenerateIndex), userMessage]
    } else {
      updatedMessages = [...messages, userMessage]
    }
    
    setMessages(updatedMessages)
    setInput('')
    setLoading(true)
    setEditingMessageId(null)

    // Initialize thinking steps based on mode and query
    const getStepsForMode = (): ThinkingStep[] => {
      switch (mode) {
        case 'documents':
          return [
            { id: '1', text: 'Analyzing document requirements', status: 'active', currentAction: 'Understanding request...' },
            { id: '2', text: 'Gathering deal data and context', status: 'pending' },
            { id: '3', text: 'Generating document content', status: 'pending' },
          ]
        case 'loi':
          return [
            { id: '1', text: 'Identifying deal and gathering details', status: 'active', currentAction: 'Loading deal data...' },
            { id: '2', text: 'Applying LOI template structure', status: 'pending' },
            { id: '3', text: 'Drafting LOI document', status: 'pending' },
          ]
        case 'diligence':
          return [
            { id: '1', text: 'Loading due diligence checklist', status: 'active', currentAction: 'Fetching checklist...' },
            { id: '2', text: 'Analyzing deal completeness', status: 'pending' },
            { id: '3', text: 'Generating progress summary', status: 'pending' },
          ]
        default:
          return [
            { id: '1', text: 'Analyzing your query and determining search strategy', status: 'active', currentAction: 'Analyzing query...' },
            { id: '2', text: 'Searching deal database for matching records', status: 'pending' },
            { id: '3', text: 'Processing and formatting results', status: 'pending' },
          ]
      }
    }
    const steps = getStepsForMode()
    setThinkingSteps(steps)

    try {
      // Step 1: Analyzing
      await new Promise(resolve => setTimeout(resolve, 600))
      setThinkingSteps(prev => prev.map(s => s.id === '1' ? { ...s, status: 'completed' } : s))
      setThinkingSteps(prev => prev.map(s => s.id === '2' ? { ...s, status: 'active', currentAction: 'Querying database...' } : s))

      // Send conversation history for context
      const conversationHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content,
      }))

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: messageContent,
          conversationHistory: conversationHistory,
        }),
      })

      // Step 2: Searching
      await new Promise(resolve => setTimeout(resolve, 400))
      setThinkingSteps(prev => prev.map(s => s.id === '2' ? { ...s, status: 'completed' } : s))
      setThinkingSteps(prev => prev.map(s => s.id === '3' ? { ...s, status: 'active', currentAction: 'Formatting data...' } : s))

      const data = await res.json()

      if (data.error) throw new Error(data.error)

      // Step 3: Processing
      await new Promise(resolve => setTimeout(resolve, 300))
      setThinkingSteps(prev => prev.map(s => s.id === '3' ? { ...s, status: 'completed' } : s))

      // Ensure we never render a completely empty assistant bubble
      const trimmedResponse =
        typeof data.response === 'string' ? data.response.trim() : ''

      let safeContent = trimmedResponse
      if (!safeContent) {
        if (data.data?.deals) {
          safeContent = 'Here are the deals I found based on your query.'
        } else if (data.data?.summary) {
          safeContent = 'Here is a quick summary of your pipeline.'
        } else {
          safeContent = ''
        }
      }

      const assistantMessage: Message = {
        role: 'assistant',
        content: safeContent,
        data: data.data,
        id: `msg-${Date.now()}`,
        timestamp: Date.now(),
      }

      setMessages(prev => [...prev, assistantMessage])
      setThinkingSteps([])
    } catch (error: any) {
      const errorMessage: Message = {
        role: 'assistant',
        content: `Error: ${error.message}`
      }
      setMessages(prev => [...prev, errorMessage])
      setThinkingSteps([])
    } finally {
      setLoading(false)
    }
  }

  const parseMessageForData = (content: string) => {
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }
    } catch {
      return null
    }
    return null
  }

  const handleAddTranscript = async () => {
    if (!selectedDeal?.id || !transcriptText.trim()) return

    setExtractingTranscript(true)
    try {
      // Ensure we have a logged-in user for RLS
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !user) {
        throw userError || new Error('You must be signed in to add transcripts.')
      }

      // First, save the transcript
      const { data: transcript, error: transcriptError } = await supabase
        .from('call_transcripts')
        .insert([{
          deal_id: selectedDeal.id,
          user_id: user.id,
          transcript_text: transcriptText,
          call_title: transcriptTitle || `Call ${new Date().toLocaleDateString()}`,
          call_date: new Date().toISOString(),
          extraction_status: 'pending'
        }])
        .select()
        .single()

      if (transcriptError) throw transcriptError

      // Extract info using AI
      const res = await fetch('/api/extract-transcript', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: transcriptText,
          dealId: selectedDeal.id,
          transcriptId: transcript.id,
          currentDealData: selectedDeal
        }),
      })

      const extractionData = await res.json()
      if (extractionData.error) throw new Error(extractionData.error)

      // Reload transcripts and updates
      const { data: updatedTranscripts } = await supabase
        .from('call_transcripts')
        .select('*')
        .eq('deal_id', selectedDeal.id)
        .order('call_date', { ascending: false })

      if (updatedTranscripts) {
        setCallTranscripts(updatedTranscripts)
      }

      const { data: updates } = await supabase
        .from('extracted_deal_updates')
        .select('*')
        .eq('deal_id', selectedDeal.id)
        .eq('approval_status', 'pending')
        .order('created_at', { ascending: false })

      if (updates) {
        setExtractedUpdates(updates)
      }

      // Show extraction results in modal
      setExtractionResults(extractionData)

      // Keep modal open to show results, but allow user to close
      if (extractionData.updates && extractionData.updates.length > 0) {
        // Don't close modal yet - show results
      } else {
        // No extractions found, close modal
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
      // Update the extracted update status
      const { error: updateError } = await supabase
        .from('extracted_deal_updates')
        .update({ approval_status: 'approved' })
        .eq('id', updateId)

      if (updateError) throw updateError

      // Update the deal field
      const updateData: any = { [fieldName]: newValue }
      const { error: dealError } = await supabase
        .from('deals')
        .update(updateData)
        .eq('id', selectedDeal.id)

      if (dealError) throw dealError

      // Update local state
      setSelectedDeal((prev: any) => ({ ...prev, [fieldName]: newValue }))
      setExtractedUpdates(prev => prev.filter(u => u.id !== updateId))

      // Update transcript status
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

  const getModePlaceholder = () => {
    switch (mode) {
      case 'documents':
        return 'Describe the document you want to generate...'
      case 'loi':
        return 'Which deal should I create an LOI for?'
      case 'diligence':
        return 'Which deal\'s due diligence are you working on?'
      default:
        return 'Ask anything about your deals...'
    }
  }

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

  return (
    <div className="flex h-screen bg-black text-white overflow-hidden relative">
      {/* Top Left Button - Fixed Position */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-4 left-4 z-50 text-white border-white/20 hover:bg-white/10 hover:border-white/30 bg-black/80 backdrop-blur-sm"
        title={sidebarOpen ? 'Hide chat history' : 'Show chat history'}
      >
        <MessageSquare className="h-4 w-4 mr-2" />
        <span className="text-xs font-medium">Chats</span>
      </Button>

      {/* Sidebar Overlay - for mobile/backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Chat History with slide animation */}
      <div
        className={`fixed lg:sticky top-0 left-0 h-full w-64 border-r border-white/10 bg-black/95 backdrop-blur-sm z-40 flex flex-col transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <Button
            onClick={createNewChat}
            className="flex-1 bg-white text-black hover:bg-white/90"
            size="sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Chat
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(false)}
            className="ml-2 text-white/60 hover:text-white hover:bg-white/10 lg:hidden"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto">
          <div className="p-2 space-y-1">
            {chatSessions.length === 0 ? (
              <div className="p-4 text-center text-white/50 text-sm">
                No chats yet. Start a new conversation!
              </div>
            ) : (
              chatSessions.map((session) => (
                <div
                  key={session.id}
                  onClick={() => {
                    setCurrentChatId(session.id)
                    loadChatMessages(session.id)
                    setSidebarOpen(false) // Close sidebar on mobile after selection
                  }}
                  className={`group relative p-3 rounded-lg cursor-pointer transition-colors ${
                    currentChatId === session.id
                      ? 'bg-white/10 border border-white/20'
                      : 'hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {session.title || 'New Chat'}
                      </p>
                      <p className="text-xs text-white/50 mt-1">
                        {new Date(session.updated_at).toLocaleDateString()}
                      </p>
                    </div>
                    {currentChatId === session.id && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          if (confirm('Delete this chat?')) {
                            deleteChat(session.id)
                          }
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/10 rounded"
                      >
                        <X className="h-3.5 w-3.5 text-white/60" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Header - Fixed */}
        <header className="border-b border-white/10 bg-black/95 backdrop-blur-sm sticky top-0 z-20 shrink-0">
        <div className="container max-w-5xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <Link href="/" className="hover:opacity-80 transition-opacity">
                <h1 className="text-lg font-semibold tracking-tight text-white">
            Deal Lab AI
          </h1>
              </Link>
        </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (confirm('Clear all chat messages?')) {
                  setMessages(getDefaultMessages(mode))
                  localStorage.removeItem(STORAGE_KEY)
                }
              }}
              className="text-white/60 hover:text-white hover:bg-white/10"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
      </div>

          {/* Mode Navigation */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            <Button
              variant={mode === 'deals' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setMode('deals')}
              className={`shrink-0 ${
                mode === 'deals' 
                  ? 'bg-white text-black hover:bg-white/90' 
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              <Briefcase className="h-4 w-4 mr-2" />
              Deals
            </Button>
            <Button
              variant={mode === 'documents' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setMode('documents')}
              className={`shrink-0 ${
                mode === 'documents' 
                  ? 'bg-white text-black hover:bg-white/90' 
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              <FileText className="h-4 w-4 mr-2" />
              Documents
            </Button>
            <Button
              variant={mode === 'loi' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setMode('loi')}
              className={`shrink-0 ${
                mode === 'loi' 
                  ? 'bg-white text-black hover:bg-white/90' 
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              <FileCheck className="h-4 w-4 mr-2" />
              LOI Generator
            </Button>
            <Button
              variant={mode === 'diligence' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setMode('diligence')}
              className={`shrink-0 ${
                mode === 'diligence' 
                  ? 'bg-white text-black hover:bg-white/90' 
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              <ClipboardList className="h-4 w-4 mr-2" />
              Due Diligence
            </Button>
            
            {mode === 'deals' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDealForm(true)}
                className="shrink-0 ml-auto border-white/30 text-white bg-white/10 hover:bg-white/20 hover:border-white/40 font-medium shadow-sm"
              >
                <Upload className="h-4 w-4 mr-2" />
                Add Deal
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Messages - Scrollable */}
      <div className="flex-1 overflow-y-auto bg-black">
        {messages.length === 0 ? (
          // Perplexity-style empty state
          <div className="flex flex-col items-center justify-center h-full px-4">
            <div className="w-full max-w-3xl">
              <div className="relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-full h-full bg-gradient-to-br from-primary/5 via-transparent to-primary/5 rounded-2xl blur-3xl"></div>
                </div>
                <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-lg bg-white flex items-center justify-center">
                        <Briefcase className="h-4 w-4 text-black" />
                      </div>
                      <span className="text-sm font-medium text-white/80">Deal Lab AI</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                    placeholder={getModePlaceholder()}
                    disabled={loading}
                    className="h-14 text-base bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-white/50 focus:ring-white/20 flex-1"
                    autoFocus
                  />
                    <Button
                      onClick={(e) => {
                        e.preventDefault()
                        sendMessage()
                      }}
                      disabled={loading || !input.trim()}
                      size="default"
                      className="h-14 px-6 bg-white text-black hover:bg-white/90"
                    >
                      {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <div className="flex items-center justify-between mt-4 text-xs text-white/50">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1.5">
                        <Briefcase className="h-3 w-3" />
                        AI-Powered
                      </span>
                      <span>•</span>
                      <span>Private Equity</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5">
                        <kbd className="px-1.5 py-0.5 rounded bg-white/10 border border-white/20 text-[10px]">⌘K</kbd>
                        <span className="text-[10px]">search</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <kbd className="px-1.5 py-0.5 rounded bg-white/10 border border-white/20 text-[10px]">↑</kbd>
                        <span className="text-[10px]">history</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
        </div>
      </div>
        ) : (
          <div className="container max-w-4xl mx-auto px-4 py-6 bg-black min-h-full">
            <div className="space-y-4">
          {messages
              .filter(msg => !searchQuery || msg.content.toLowerCase().includes(searchQuery.toLowerCase()))
              .map((msg, idx) => {
              // Use msg.data if available, otherwise try to parse from content
              const data = msg.data || parseMessageForData(msg.content)
              const isEditing = editingMessageId === idx && msg.role === 'user'

            return (
              <div
                key={msg.id || idx}
                  className={`group flex gap-3 ${
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {msg.role === 'assistant' && (
                    <Avatar className="h-8 w-8 border border-white/20 shrink-0 mt-1">
                      <AvatarFallback className="bg-white text-black font-medium text-xs">
                      AI
                    </AvatarFallback>
                  </Avatar>
                )}

                  <div className={`max-w-[80%] ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-2`}>
                    {/* Only show text if no structured data */}
                    {(!data?.deals && !data?.summary) && (
                      <div
                        className={`group/message relative rounded-lg px-4 py-3 ${
                      msg.role === 'user'
                            ? 'bg-white text-black'
                            : 'bg-white/10 text-white border border-white/10'
                        }`}
                      >
                        {isEditing ? (
                          <div className="flex flex-col gap-2">
                            <Input
                              defaultValue={msg.content}
                              onKeyPress={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                  const input = e.currentTarget.value
                                  if (input.trim()) {
                                    sendMessage(input, idx)
                                  }
                                }
                                if (e.key === 'Escape') {
                                  setEditingMessageId(null)
                                }
                              }}
                              className="bg-white/10 border-white/20 text-white"
                              autoFocus
                            />
                            <div className="flex gap-2 text-xs">
                              <span className="text-white/50">Press Enter to send, Esc to cancel</span>
                            </div>
                          </div>
                        ) : (
                          <>
                            <p className="whitespace-pre-wrap text-sm leading-relaxed pr-8">
                      {msg.content}
                    </p>
                            <div className="absolute top-2 right-2 opacity-0 group-hover/message:opacity-100 transition-opacity flex gap-1">
                              <MessageCopyButton content={msg.content} isUser={msg.role === 'user'} />
                              {msg.role === 'user' && (
                                <button
                                  onClick={() => {
                                    setEditingMessageId(idx)
                                    setEditingContent(msg.content)
                                  }}
                                  className="p-1.5 rounded hover:bg-white/10"
                                  title="Edit message"
                                >
                                  <Edit2 className={`h-3.5 w-3.5 ${msg.role === 'user' ? 'text-black/60' : 'text-white/60'}`} />
                                </button>
                              )}
                              {msg.role === 'assistant' && idx === messages.length - 1 && (
                                <button
                                  onClick={() => {
                                    const lastUserMsgIndex = messages.map((m, i) => m.role === 'user' ? i : -1).filter(i => i !== -1).pop()
                                    if (lastUserMsgIndex !== undefined) {
                                      sendMessage(messages[lastUserMsgIndex].content, lastUserMsgIndex)
                                    }
                                  }}
                                  className="p-1.5 rounded hover:bg-white/10"
                                  title="Regenerate response"
                                >
                                  <RotateCcw className="h-3.5 w-3.5 text-white/60" />
                                </button>
                              )}
                              <button
                                onClick={() => {
                                  setMessages(prev => prev.filter((_, i) => i !== idx))
                                }}
                                className="p-1.5 rounded hover:bg-white/10"
                                title="Delete message"
                              >
                                <X className={`h-3.5 w-3.5 ${msg.role === 'user' ? 'text-black/60' : 'text-white/60'}`} />
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    )}

                    {/* Show structured data prominently */}
                    {msg.role === 'assistant' && data?.deals && (
                    <div className="w-full">
                        <DealTable
                          deals={data.deals}
                          onDealClick={(deal) => {
                            setSelectedDeal(deal)
                            setDealDetailOpen(true)
                          }}
                        />
                    </div>
                  )}

                    {msg.role === 'assistant' && data?.summary && (
                    <div className="w-full">
                        <SummaryCard summary={data.summary} />
                    </div>
                  )}
                </div>

                {msg.role === 'user' && (
                    <Avatar className="h-8 w-8 border border-white/20 shrink-0 mt-1">
                      <AvatarFallback className="bg-white/20 text-white font-medium text-xs">
                      U
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            )
          })}

            {loading && thinkingSteps.length > 0 && (
              <div className="flex gap-3 justify-start">
                <Avatar className="h-8 w-8 border border-white/20 shrink-0 mt-1">
                  <AvatarFallback className="bg-white text-black font-medium text-xs">
                  AI
                </AvatarFallback>
              </Avatar>
                <div className="rounded-lg bg-white/5 border border-white/10 w-full max-w-[80%] p-5">
                  <div className="relative pl-6">
                    {/* Connecting line */}
                    <div className="absolute left-2 top-2 bottom-2 w-px bg-white/10" />
                    
                    <div className="space-y-5">
                      {thinkingSteps.map((step, idx) => (
                        <div key={step.id} className="flex items-start gap-4 relative">
                          <div className="absolute -left-6 top-0.5 shrink-0 relative z-10">
                            {step.status === 'completed' ? (
                              <div className="h-4 w-4 rounded-full bg-white/20 flex items-center justify-center border border-white/30">
                                <Check className="h-2.5 w-2.5 text-white" />
                </div>
                            ) : step.status === 'active' ? (
                              <div className="h-4 w-4 rounded-full border border-white/40 flex items-center justify-center bg-white/5">
                                <div className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" style={{ animationDuration: '1.5s' }} />
                              </div>
                            ) : (
                              <div className="h-4 w-4 rounded-full border border-white/20 bg-transparent" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm leading-relaxed transition-all duration-300 ${
                              step.status === 'completed' 
                                ? 'text-white/50' 
                                : step.status === 'active'
                                ? 'text-white/90'
                                : 'text-white/30'
                            }`}>
                              {step.text}
                            </p>
                            {step.status === 'active' && step.currentAction && (
                              <p className="text-xs text-white/40 mt-2 italic animate-pulse" style={{ animationDuration: '2s' }}>
                                {step.currentAction}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
            </div>
          )}

          <div ref={scrollRef} />
        </div>
          </div>
        )}
      </div>

      {/* Input - Fixed at bottom */}
      <div className="border-t border-white/10 bg-black/95 backdrop-blur-sm sticky bottom-0 z-20 shrink-0">
        <div className="container max-w-4xl mx-auto px-4 py-4">
          <div className="flex gap-2 items-end">
            <div className="flex-1 relative">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    sendMessage()
                  }
                }}
                onKeyDown={(e) => {
                  // Arrow up to get last message
                  if (e.key === 'ArrowUp' && !input && messages.length > 0) {
                    e.preventDefault()
                    const lastUserMsg = [...messages].reverse().find(m => m.role === 'user')
                    if (lastUserMsg) {
                      setInput(lastUserMsg.content)
                    }
                  }
                }}
                placeholder={
                  mode === 'documents' ? 'Describe the document you want to generate...' :
                  mode === 'loi' ? 'Which deal should I create an LOI for?' :
                  mode === 'diligence' ? 'Which deal\'s due diligence are you working on?' :
                  'Ask about your deals...'
                }
                disabled={loading || enhancing}
                className="flex-1 h-12 text-sm bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-white/50 focus:ring-white/20 pr-10"
              />
              {input && (
                <button
                  onClick={() => setInput('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded opacity-70 hover:opacity-100"
                >
                  <X className="h-3.5 w-3.5 text-white/60" />
                </button>
              )}
            </div>
            <Button
              onClick={(e) => {
                e.preventDefault()
                enhancePrompt()
              }}
              disabled={loading || enhancing || !input.trim()}
              size="default"
              variant="outline"
              className="h-12 px-4 bg-white/5 border-white/20 text-white hover:bg-white/10 hover:text-white shrink-0"
              title="Enhance prompt with AI"
            >
              {enhancing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
            </Button>
            <Button
              onClick={(e) => {
                e.preventDefault()
                sendMessage()
              }}
              disabled={loading || enhancing || !input.trim()}
              size="default"
              className="h-12 px-6 bg-white text-black hover:bg-white/90 shrink-0"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          {messages.length > 0 && (
            <div className="flex items-center justify-between mt-2 text-xs text-white/40">
              <span>Press Enter to send, Shift+Enter for new line</span>
              <span>{messages.filter(m => m.role === 'user').length} {messages.filter(m => m.role === 'user').length === 1 ? 'message' : 'messages'}</span>
        </div>
          )}
        </div>
      </div>

      {/* Deal Form Sheet */}
      <Sheet open={showDealForm} onOpenChange={setShowDealForm}>
        <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto p-0">
          <div className="h-full flex flex-col">
            <SheetHeader className="px-6 pt-6 pb-4 border-b">
              <SheetTitle>Add New Deal</SheetTitle>
              <SheetDescription>
                Fill in the deal information below. All fields marked with * are required.
              </SheetDescription>
            </SheetHeader>
            <div className="flex-1 overflow-y-auto px-6 py-6">
              <DealForm
                onSuccess={() => {
                  setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: 'Deal added successfully! You can now query it in the chat.'
                  }])
                }}
                onClose={() => setShowDealForm(false)}
              />
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Deal Detail Sheet */}
      <Sheet
        open={dealDetailOpen && !!selectedDeal}
        onOpenChange={(open) => {
          setDealDetailOpen(open)
          if (!open) {
            setSelectedDeal(null)
          }
        }}
      >
        <SheetContent side="right" className="w-full sm:max-w-3xl overflow-y-auto p-0">
          {selectedDeal && (
            <div className="h-full flex flex-col bg-black text-white">
              <SheetHeader className="sr-only">
                <SheetTitle>{selectedDeal.company_name || 'Deal Details'}</SheetTitle>
              </SheetHeader>
              {/* Header with gradient accent */}
              <div className="px-8 pt-8 pb-6 border-b border-white/10 bg-gradient-to-b from-white/5 to-transparent">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h2 className="text-3xl font-bold tracking-tight text-white mb-1">
                      {selectedDeal.company_name || 'Deal Details'}
                    </h2>
                    <div className="flex items-center gap-3 mt-2">
                      <Badge variant="outline" className="border-white/30 text-white/90 bg-white/10 text-xs px-2.5 py-1">
                        {selectedDeal.deal_name || 'Unnamed Deal'}
                      </Badge>
                      {selectedDeal.sector && (
                        <Badge variant="outline" className="border-white/30 text-white/90 bg-white/10 text-xs px-2.5 py-1">
                          {selectedDeal.sector}
                        </Badge>
                      )}
                      <Badge
                        variant={selectedDeal.status === 'closed_lost' ? 'destructive' : 'default'}
                        className={`text-xs px-2.5 py-1 ${
                          selectedDeal.status === 'closed_lost'
                            ? 'bg-red-500/80 text-white'
                            : selectedDeal.status === 'closed_won'
                            ? 'bg-emerald-500/80 text-white'
                            : 'bg-white/20 text-white border-white/30'
                        }`}
                      >
                        {selectedDeal.status?.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) || 'N/A'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">
                <div className="px-8 py-6 space-y-6">
                  {/* Financial Metrics - Prominent Card */}
                  <Card className="bg-white/5 border-white/10 p-6">
                    <h3 className="text-sm font-semibold text-white/90 uppercase tracking-wide mb-4 flex items-center gap-2">
                      <Briefcase className="h-4 w-4" />
                      Financial Metrics
                    </h3>
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <p className="text-xs text-white/50 uppercase tracking-wide mb-2">Revenue</p>
                        <p className="text-2xl font-bold text-white font-mono">
                          {selectedDeal.revenue ? formatCurrency(selectedDeal.revenue) : <span className="text-white/40">N/A</span>}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-white/50 uppercase tracking-wide mb-2">Valuation Ask</p>
                        <p className="text-2xl font-bold text-white font-mono">
                          {selectedDeal.valuation_ask ? formatCurrency(selectedDeal.valuation_ask) : <span className="text-white/40">N/A</span>}
                        </p>
                      </div>
                      {selectedDeal.ebitda && (
                        <div>
                          <p className="text-xs text-white/50 uppercase tracking-wide mb-2">EBITDA</p>
                          <p className="text-xl font-semibold text-white font-mono">
                            {formatCurrency(selectedDeal.ebitda)}
                          </p>
                        </div>
                      )}
                    </div>
                  </Card>

                  {/* Deal Information */}
                  <Card className="bg-white/5 border-white/10 p-6">
                    <h3 className="text-sm font-semibold text-white/90 uppercase tracking-wide mb-4">Deal Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-white/50 uppercase tracking-wide mb-1.5">Geography</p>
                        <p className="text-sm text-white">{selectedDeal.geography || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-white/50 uppercase tracking-wide mb-1.5">Analyst Owner</p>
                        <p className="text-sm text-white font-medium">{selectedDeal.analyst_owner || 'Unassigned'}</p>
                      </div>
                    </div>
                  </Card>

                  {/* Analyst Notes Section */}
                  <div className="space-y-5">
                    <h3 className="text-sm font-semibold text-white/90 uppercase tracking-wide flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Analyst Notes
                    </h3>

                    <Card className="bg-white/5 border-white/10 p-5">
                      <label className="text-xs text-white/70 uppercase tracking-wide mb-2 block">
                        Executive Summary
                      </label>
                      <Textarea
                        defaultValue={selectedDeal.executive_summary || ''}
                        onBlur={async (e: React.FocusEvent<HTMLTextAreaElement>) => {
                          const value = e.target.value
                          if (value !== selectedDeal.executive_summary) {
                            try {
                              await supabase
                                .from('deals')
                                .update({ executive_summary: value })
                                .eq('id', selectedDeal.id)
                              setSelectedDeal({
                                ...selectedDeal,
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
                        defaultValue={selectedDeal.key_risks || ''}
                        onBlur={async (e: React.FocusEvent<HTMLTextAreaElement>) => {
                          const value = e.target.value
                          if (value !== selectedDeal.key_risks) {
                            try {
                              await supabase
                                .from('deals')
                                .update({ key_risks: value })
                                .eq('id', selectedDeal.id)
                              setSelectedDeal({
                                ...selectedDeal,
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
                        defaultValue={selectedDeal.meeting_notes || ''}
                        onBlur={async (e: React.FocusEvent<HTMLTextAreaElement>) => {
                          const value = e.target.value
                          if (value !== selectedDeal.meeting_notes) {
                            try {
                              await supabase
                                .from('deals')
                                .update({ meeting_notes: value })
                                .eq('id', selectedDeal.id)
                              setSelectedDeal({
                                ...selectedDeal,
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

                  {/* Call Transcripts Section */}
                  <Card className="bg-white/5 border-white/10 p-5">
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

                    {/* Pending Extractions - Approval Required */}
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

                    {/* Call History */}
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

                  {/* Files & Documents Section */}
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
                          if (selectedDeal?.id) {
                            handleDealFilesUpload(e, selectedDeal.id)
                          }
                        }}
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingFiles || !selectedDeal?.id}
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
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

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
                  Review and approve these changes in the deal detail panel.
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
    </div>
  )
}
