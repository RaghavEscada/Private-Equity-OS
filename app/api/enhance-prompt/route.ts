import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: NextRequest) {
  try {
    const { prompt, context, mode } = await req.json()

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
    }

    // Build context string from recent messages
    const contextString = context && context.length > 0
      ? context.map((msg: any) => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`).join('\n')
      : 'No previous conversation context.'

    // Mode-specific enhancement instructions
    const modeInstructions: Record<string, string> = {
      deals: 'Focus on making the query more specific for deal database searches. Include relevant filters, sectors, or metrics if appropriate.',
      documents: 'Enhance the prompt to be more detailed about document requirements, format preferences, and key information to include.',
      loi: 'Make the prompt more specific about LOI terms, deal structure, valuation, and any special conditions.',
      diligence: 'Enhance the prompt to be more comprehensive about due diligence areas, specific checks, or deal details needed.',
    }

    const systemPrompt = `You are a prompt enhancement assistant for a Private Equity deal management system. Your task is to improve user prompts by:

1. Understanding the context of the conversation
2. Making the prompt more specific, clear, and actionable
3. Adding relevant details based on the conversation history
4. Maintaining the user's original intent
5. ${modeInstructions[mode] || 'Making the prompt more effective for the current mode.'}

IMPORTANT RULES:
- Keep the enhanced prompt concise but comprehensive
- Don't add information that wasn't implied in the original prompt
- Maintain the user's tone and style
- Only enhance, don't completely rewrite
- Return ONLY the enhanced prompt, no explanations or meta-commentary

Conversation context:
${contextString}

Current mode: ${mode}`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Enhance this prompt: "${prompt}"` },
      ],
      temperature: 0.7,
      max_tokens: 300,
    })

    const enhanced = completion.choices[0].message.content?.trim()

    return NextResponse.json({ enhanced })
  } catch (error: any) {
    console.error('Error enhancing prompt:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to enhance prompt' },
      { status: 500 }
    )
  }
}











