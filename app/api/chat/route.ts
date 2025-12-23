// app/api/chat/route.ts
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

const tools: OpenAI.Chat.ChatCompletionTool[] = [
  {
    type: 'function',
    function: {
      name: 'search_deals',
      description:
        'Search for deals in the database. ALWAYS use this when user asks to list deals, show deals, or see deals. If no filters are specified, return ALL deals. Use when user says "list them", "show all", "list all deals", etc. ALSO use this when the user asks about a specific company or deal (e.g. "what do you think of CloudSync Technologies", "tell me about MedTech Analytics") – in those cases, pass the extracted company or deal name in company_name so you return JUST that deal, not the whole pipeline.',
      parameters: {
        type: 'object',
        properties: {
          status: {
            type: 'string',
            description: 'Deal status: diligence, nda_signed, loi_signed, etc. Only include if user specifically filters by status.',
          },
          sector: {
            type: 'string',
            description: 'Sector: SaaS, FinTech, Healthcare IT, etc. Only include if user specifically filters by sector.',
          },
          min_revenue: {
            type: 'number',
            description: 'Minimum revenue in dollars. Only include if user specifies a minimum revenue.',
          },
          company_name: {
            type: 'string',
            description: 'Company name or deal name to search for. Use this when user mentions a specific company or deal, or asks about "it", "this company", etc. in context of a previously mentioned company.',
          },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_pipeline_summary',
      description: 'Get pipeline statistics and summary',
      parameters: { type: 'object', properties: {} },
    },
  },
]

async function executeTool(toolName: string, args: any) {
  if (toolName === 'search_deals') {
    let query = supabase.from('deals').select('*')
    if (args.status) query = query.eq('status', args.status)
    if (args.sector) query = query.ilike('sector', `%${args.sector}%`)
    if (args.min_revenue) query = query.gte('revenue', args.min_revenue)
    if (args.company_name) {
      const term = String(args.company_name).trim()
      if (term.length > 0) {
        // Match either company_name or deal_name, case-insensitive, partial match
        query = query.or(
          `company_name.ilike.%${term}%,deal_name.ilike.%${term}%`
        )
      }
    }
    
    const { data, error } = await query
    if (error) throw error
    
    return { success: true, count: data?.length || 0, deals: data }
  }

  if (toolName === 'get_pipeline_summary') {
    const { data, error } = await supabase.from('deals').select('*')
    if (error) throw error
    
    return {
      success: true,
      summary: {
        total: data?.length || 0,
        active: data?.filter(d => !['closed_won', 'closed_lost'].includes(d.status)).length || 0,
        total_value: data?.reduce((sum, d) => sum + (d.valuation_ask || 0), 0) || 0,
      },
    }
  }

  return { success: false, error: 'Unknown tool' }
}

export async function POST(req: NextRequest) {
  try {
    const { message, conversationHistory } = await req.json()

    // Build conversation context from history
    const conversationMessages: any[] = []
    
    if (conversationHistory && Array.isArray(conversationHistory)) {
      // Add recent conversation history (last 10 messages for context)
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

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are a helpful, conversational assistant for a private equity deal pipeline. You have a friendly, professional tone and provide natural, engaging responses.

PERSONALITY & TONE:
- Be conversational, friendly, and natural - like talking to a colleague
- Show personality and engagement - not robotic or overly formal
- Use natural language and occasional casual expressions when appropriate
- Be helpful and insightful, not just functional

CRITICAL RULES:
- NEVER provide unsolicited greetings or long introductions about capabilities
- ALWAYS use conversation context - if a company name or deal was mentioned recently, search for it automatically
- When the user asks about a specific company or deal (\"what do you think of CloudSync Technologies\", \"tell me about MedTech Analytics\", \"what are its numbers\"), call search_deals and pass company_name with the extracted name so you return JUST that deal, not the full pipeline
- When users ask about \"it\" / \"this company\" / \"this deal\", resolve the reference from context and again call search_deals with company_name
- When users ask to "list deals", "show all deals", "list them", or similar queries, you MUST call the search_deals function; if no filters are specified, call search_deals with empty parameters to get all deals
- Be proactive - don't ask for clarification when the intent is clear from context
- Extract company names, deal names, or sectors from the conversation and search automatically
- Keep responses natural and engaging while being helpful`,
        },
        ...conversationMessages,
        { role: 'user', content: message },
      ],
      tools,
      tool_choice: 'auto',
    })

    const assistantMessage = response.choices[0].message

    if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
      // Process all tool calls
      const toolResults = await Promise.all(
        assistantMessage.tool_calls.map(async (toolCall) => {
          if (toolCall.type !== 'function') {
            throw new Error('Only function tool calls are supported')
          }

          const args = toolCall.function.arguments
            ? JSON.parse(toolCall.function.arguments)
            : {}

          const result = await executeTool(toolCall.function.name, args)

          return {
            toolCallId: toolCall.id,
            toolName: toolCall.function.name,
            result,
          }
        })
      )

      // Build tool messages for all tool calls
      const toolMessages = toolResults.map(({ toolCallId, result }) => ({
        role: 'tool' as const,
        tool_call_id: toolCallId,
        content: JSON.stringify(result),
      }))

      const finalResponse = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are a helpful, conversational assistant for a private equity deal pipeline. You have a friendly, professional tone and provide natural, engaging responses.

PERSONALITY & TONE:
- Be conversational, friendly, and natural - like talking to a colleague
- Show personality and engagement - not robotic or overly formal
- Use natural language and occasional casual expressions when appropriate
- Be helpful and insightful, not just functional
- Add brief insights or observations when relevant

CRITICAL RULES:
- NEVER provide unsolicited greetings or long introductions about capabilities
- When structured data (tables/cards) is being displayed:
  - Provide a brief, natural contextual response (1-2 sentences) before the data
  - Examples: "Sure, here are the deals:", "Here's your pipeline overview:", "Found these deals matching your criteria:", "Here's what I found:"
  - Keep it conversational and natural - like you're explaining to a colleague
  - The data visualization will show all details, so don't repeat them in text
  - You can add a brief insight or observation if relevant
- If no structured data, provide a natural, helpful response without greetings
- Be engaging and conversational while being helpful`,
          },
          { role: 'user', content: message },
          {
            role: 'assistant',
            content: assistantMessage.content,
            tool_calls: assistantMessage.tool_calls,
          },
          ...toolMessages,
        ],
      })

      // Include structured data in response for frontend to render tables/cards
      const responseData: any = {
        response: finalResponse.choices[0].message.content,
      }

      // Add deals data if search_deals was called
      const dealsResult = toolResults.find((tr) => tr.toolName === 'search_deals')
      if (dealsResult && dealsResult.result.deals) {
        responseData.data = { deals: dealsResult.result.deals }
      }

      // Add summary data if get_pipeline_summary was called
      const summaryResult = toolResults.find((tr) => tr.toolName === 'get_pipeline_summary')
      if (summaryResult && summaryResult.result.summary) {
        responseData.data = { summary: summaryResult.result.summary }
      }

      return NextResponse.json(responseData)
    }

    return NextResponse.json({ response: assistantMessage.content })
  } catch (error: any) {
    console.error('Chat API error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}