import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { dealData, includeFinancials = true } = await request.json()

    const prompt = `You are a senior private equity analyst creating a professional one-page company overview.

Generate a comprehensive, well-structured one-pager based on the following information:

Company Name: ${dealData.company_name}
Sector: ${dealData.sector || 'Not specified'}
${dealData.executive_summary ? `Overview: ${dealData.executive_summary}` : ''}

${dealData.revenue ? `Revenue: $${dealData.revenue.toLocaleString()}` : ''}
${dealData.arr ? `ARR: $${dealData.arr.toLocaleString()}` : ''}
${dealData.mrr ? `MRR: $${dealData.mrr.toLocaleString()}` : ''}
${dealData.ebitda ? `EBITDA: $${dealData.ebitda.toLocaleString()}` : ''}
${dealData.valuation_ask ? `Valuation: $${dealData.valuation_ask.toLocaleString()}` : ''}

${dealData.customer_count ? `Customers: ${dealData.customer_count.toLocaleString()}` : ''}
${dealData.employee_count ? `Employees: ${dealData.employee_count}` : ''}
${dealData.arr_growth_rate ? `Growth Rate: ${dealData.arr_growth_rate}%` : ''}

${dealData.competitors ? `Competitors: ${dealData.competitors}` : ''}
${dealData.key_risks ? `Key Risks: ${dealData.key_risks}` : ''}

${dealData.geography ? `Geography: ${dealData.geography}` : ''}
${dealData.analyst_owner ? `Analyst: ${dealData.analyst_owner}` : ''}

Format the one-pager with these sections:

**Company Overview**
- Company name, flagship product (if applicable), industry
- Business model
- Founded date (if known), location, team size
- Brief description of what the company does

**Product & Solutions**
- Core products/services
- Key features and capabilities
- Target market and customer segments

**Business Model & Revenue**
- Revenue streams
- Pricing model
- Revenue mix (recurring vs one-time)

**Financial Performance**
${includeFinancials ? '- Revenue figures and growth\n- Margins\n- Key financial metrics' : '(Omitted)'}

**Market Position**
- Target market segments
- Notable clients/partnerships
- Competitive advantages

**Go-to-Market Strategy**
- Sales channels
- Marketing approach
- Strategic partnerships

**Operations & Team**
- Team structure
- Operational capabilities
- Scalability

**Strategic Positioning**
- Key strengths
- Market differentiation
- Long-term positioning

Keep it concise, professional, and fact-based. Use bullet points where appropriate. Format in clean markdown.`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are a senior private equity analyst who creates concise, professional company one-pagers. Your output is always well-structured, data-driven, and formatted in clean markdown.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    })

    const onePager = completion.choices[0]?.message?.content || 'Failed to generate one-pager'

    return NextResponse.json({
      success: true,
      onePager,
      usage: completion.usage
    })
  } catch (error: any) {
    console.error('Error generating one-pager:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate one-pager' },
      { status: 500 }
    )
  }
}











