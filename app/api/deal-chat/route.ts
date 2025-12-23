import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { createClient } from '@supabase/supabase-js'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const { message, dealId, conversationHistory } = await req.json()

    // Fetch all deal context for RAG
    const { data: deal, error: dealError } = await supabase
      .from('deals')
      .select('*')
      .eq('id', dealId)
      .single()

    if (dealError) throw dealError

    // Fetch call transcripts
    const { data: transcripts, error: transcriptsError } = await supabase
      .from('call_transcripts')
      .select('*')
      .eq('deal_id', dealId)
      .order('call_date', { ascending: false })

    // Fetch files metadata
    const { data: files, error: filesError } = await supabase
      .from('deal_files')
      .select('*')
      .eq('deal_id', dealId)

    // Build comprehensive context for RAG
    const dealContext = `
# Deal Context for ${deal.company_name || 'Company'}

## Basic Information
- Company: ${deal.company_name || 'N/A'}
- Deal Name: ${deal.deal_name || 'N/A'}
- Sector: ${deal.sector || 'N/A'}
- Status: ${deal.status?.replace(/_/g, ' ') || 'N/A'}
- Geography: ${deal.geography || 'N/A'}
- Analyst Owner: ${deal.analyst_owner || 'Unassigned'}

## Financial Metrics
- Revenue: ${deal.revenue ? `$${deal.revenue.toLocaleString()}` : 'N/A'}
- Valuation Ask: ${deal.valuation_ask ? `$${deal.valuation_ask.toLocaleString()}` : 'N/A'}
- EBITDA: ${deal.ebitda ? `$${deal.ebitda.toLocaleString()}` : 'N/A'}

## Executive Summary
${deal.executive_summary || 'No executive summary available.'}

## Key Risks
${deal.key_risks || 'No key risks documented.'}

## Meeting Notes
${deal.meeting_notes || 'No meeting notes available.'}

## Call Transcripts
${transcripts && transcripts.length > 0 
  ? transcripts.map((t: any, idx: number) => `
### Transcript ${idx + 1}: ${t.call_title || 'Untitled Call'}
Date: ${new Date(t.call_date).toLocaleString()}
Status: ${t.extraction_status}

Content:
${t.transcript_text}

---
`).join('\n')
  : 'No call transcripts available.'}

## Attached Files
${files && files.length > 0
  ? files.map((f: any) => `- ${f.file_name} (uploaded ${new Date(f.created_at).toLocaleDateString()})`).join('\n')
  : 'No files attached.'}
`

    // Build conversation context
    const conversationMessages: any[] = []
    
    if (conversationHistory && Array.isArray(conversationHistory)) {
      const recentHistory = conversationHistory.slice(-10)
      recentHistory.forEach((msg: any) => {
        if (msg.role === 'user' || msg.role === 'assistant') {
          conversationMessages.push({
            role: msg.role,
            content: msg.content,
          })
        }
      })
    }

    // Call OpenAI with RAG context
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are a highly experienced private equity analyst with 10+ years at top-tier firms. You specialize in deal evaluation, financial modeling, and risk assessment. You have deep expertise in the following deal:

${dealContext}

YOUR ANALYTICAL APPROACH:
- Always ground analysis in specific financial metrics and data points
- Calculate and reference key ratios (EV/Revenue, EV/EBITDA) when relevant
- Identify red flags and investment risks proactively
- Assess deal attractiveness relative to typical PE benchmarks
- Synthesize insights across all available documents and transcripts
- Think critically about management claims vs. actual data
- Consider both upside potential and downside protection

COMMUNICATION STYLE:
- Professional but direct - like advising a senior partner
- Lead with key insights, then supporting details
- Use precise financial terminology appropriately
- Quantify observations whenever possible (e.g., "margins compressed 12% YoY")
- Flag gaps in diligence or missing critical information
- When data is incomplete, acknowledge it and suggest what's needed
- Reference specific transcript dates, meeting notes, or documents when making points

RESPONSE FORMAT:
- Start with a clear, direct answer to the question
- Support with specific data points and calculations
- Include relevant context from transcripts or notes
- End with implications or recommendations when appropriate
- If you see concerning patterns, flag them explicitly

FINANCIAL ANALYSIS STANDARDS:
- Always consider revenue quality and sustainability
- Assess competitive positioning and moat strength
- Evaluate management team capability based on available notes
- Consider market timing and macro factors when mentioned
- Think about exit multiples and IRR potential
- Flag any inconsistencies between documents

Remember: Your job is to help make better investment decisions by providing rigorous, data-driven analysis.`,
        },
        ...conversationMessages,
        { role: 'user', content: message },
      ],
      temperature: 0.7,
      max_tokens: 1500,
    })

    const assistantMessage = response.choices[0].message.content

    return NextResponse.json({ response: assistantMessage })
  } catch (error: any) {
    console.error('Deal chat API error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

