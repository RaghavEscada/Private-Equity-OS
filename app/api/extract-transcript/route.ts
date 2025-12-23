import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { createClient } from '@supabase/supabase-js'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const { transcript, dealId, transcriptId, currentDealData } = await req.json()

    if (!transcript || !dealId || !transcriptId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Extract information from transcript using AI
    const systemPrompt = `You are an AI assistant that extracts structured information from private equity deal call transcripts.

Your task is to identify:
1. Financial metrics mentioned (revenue, valuation, EBITDA, pricing, etc.)
2. Status changes (deal progression, milestones)
3. Key dates or timelines
4. Important commitments or agreements
5. Risk factors or concerns mentioned
6. Any other relevant deal information

Compare the transcript with the current deal data and identify:
- What has CHANGED (e.g., revenue went from $4k to $40k)
- What is NEW information not in the current deal
- Confidence level (0.0 to 1.0) for each extraction

Return ONLY a JSON object with this structure:
{
  "updates": [
    {
      "field_name": "revenue" | "valuation_ask" | "status" | "ebitda" | etc.,
      "old_value": "current value from deal or null",
      "new_value": "extracted value from transcript",
      "confidence_score": 0.95,
      "reasoning": "brief explanation of why this was extracted"
    }
  ],
  "summary": "Brief summary of key points from the call"
}

IMPORTANT:
- Only extract information that is EXPLICITLY stated in the transcript
- Use high confidence (0.8+) only for clear, unambiguous statements
- Use lower confidence (0.5-0.7) for inferred or implied information
- Return empty updates array if nothing relevant is found
- Always provide reasoning for each extraction`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: `Current Deal Data:
${JSON.stringify(currentDealData, null, 2)}

Call Transcript:
${transcript}

Extract all relevant information and changes.`
        },
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' },
    })

    const extractionResult = JSON.parse(completion.choices[0].message.content || '{}')

    // Save extracted updates to database
    if (extractionResult.updates && extractionResult.updates.length > 0) {
      const updatesToInsert = extractionResult.updates.map((update: any) => ({
        deal_id: dealId,
        transcript_id: transcriptId,
        field_name: update.field_name,
        old_value: update.old_value,
        new_value: String(update.new_value),
        confidence_score: update.confidence_score,
        approval_status: 'pending'
      }))

      const { error: insertError } = await supabase
        .from('extracted_deal_updates')
        .insert(updatesToInsert)

      if (insertError) {
        console.error('Failed to save extracted updates:', insertError)
      }

      // Update transcript status
      await supabase
        .from('call_transcripts')
        .update({
          extracted_data: extractionResult,
          extraction_status: 'extracted'
        })
        .eq('id', transcriptId)
    }

    return NextResponse.json({
      success: true,
      extraction: extractionResult,
      updates: extractionResult.updates || []
    })
  } catch (error: any) {
    console.error('Error extracting transcript:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to extract transcript' },
      { status: 500 }
    )
  }
}

