export const config = {
  api: { bodyParser: { sizeLimit: '2mb' } }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { customerMessage, businessName, industry, productInfo, price, availability, tone, previousMessages } = req.body

  if (!customerMessage || !productInfo) {
    return res.status(400).json({ error: 'Customer message and product info are required.' })
  }

  const industryContext = {
    fashion: 'Nigerian fashion, clothing, and accessories market. Customers care about style, quality, authenticity, and fast delivery.',
    food: 'Nigerian food, catering, and meal delivery market. Customers care about freshness, taste, hygiene, and delivery time.',
    electronics: 'Nigerian electronics and gadgets market. Customers care about warranty, authenticity, price negotiation, and after-sales support.',
    beauty: 'Nigerian beauty, skincare, and cosmetics market. Customers care about skin-type suitability, ingredients, and results.',
    general: 'Nigerian SME market. Customers value trust, good pricing, fast responses, and personal service.',
  }

  const toneGuide = {
    friendly: 'Warm, conversational, and approachable. Like a helpful friend running a business. Natural Nigerian warmth without being overly formal.',
    premium: 'Polished, confident, and professional. Elevated language. The kind of brand that commands respect and premium pricing.',
    persuasive: 'Direct, energetic, and conversion-focused. Create desire, build urgency, close the sale. Still human, never pushy.',
  }

  const historyText = previousMessages && previousMessages.length > 0
    ? `\n\nConversation history:\n${previousMessages.map(m => `${m.role === 'customer' ? 'Customer' : 'Business'}: ${m.text}`).join('\n')}`
    : ''

  const systemPrompt = `You are SellDesk, an elite WhatsApp sales assistant for Nigerian businesses. Help business owners craft replies that convert customers into buyers.

You understand the Nigerian market:
- Customers often negotiate on price
- Trust and social proof matter enormously  
- Responses must feel human, not robotic
- WhatsApp messages should be concise with natural line breaks
- Never use dash bullet points

Industry: ${industryContext[industry] || industryContext.general}
Tone: ${toneGuide[tone] || toneGuide.friendly}

Return ONLY valid JSON. No markdown. No backticks.`

  const userPrompt = `Business: ${businessName || 'Our Business'}
Product Info: ${productInfo}
${price ? `Price: ${price}` : ''}
${availability ? `Availability: ${availability}` : ''}${historyText}

Customer message: "${customerMessage}"

Return this exact JSON:
{
  "reply": "The WhatsApp reply to send. Natural line breaks. Sound human. Be concise.",
  "intent": "inquiry | price_objection | ready_to_buy | complaint | negotiating | just_browsing",
  "intent_label": "Human readable intent e.g. Customer is negotiating price",
  "conversion_probability": 0.0,
  "conversion_label": "LOW | MEDIUM | HIGH",
  "strategy_used": "One sentence on the sales strategy applied",
  "follow_up_tip": "One specific tip for what to do after sending this reply",
  "alternative_reply": "A shorter or differently toned alternative"
}`

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-opus-4-5',
        max_tokens: 1500,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }],
      }),
    })

    const data = await response.json()
    if (!response.ok) return res.status(500).json({ error: 'AI service error. Please try again.' })

    const raw = data.content.map(b => b.text || '').join('')
    const cleaned = raw.replace(/```json|```/g, '').trim()

    let parsed
    try { parsed = JSON.parse(cleaned) }
    catch { return res.status(500).json({ error: 'Could not parse AI response. Please try again.' }) }

    return res.status(200).json(parsed)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Unexpected error. Please try again.' })
  }
}
