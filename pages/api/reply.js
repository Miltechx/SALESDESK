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
    friendly: 'Warm, conversational, approachable. Natural Nigerian warmth. Not overly formal.',
    premium: 'Polished, confident, professional. Commands respect and premium pricing.',
    persuasive: 'Direct, energetic, conversion-focused. Creates desire, builds urgency. Human, never annoying.',
  }

  const historyText = previousMessages && previousMessages.length > 0
    ? `\n\nConversation so far:\n${previousMessages.map(m => `${m.role === 'customer' ? 'Customer' : 'Business'}: ${m.text}`).join('\n')}`
    : ''

  const systemPrompt = `You are SellDesk, an elite WhatsApp sales assistant for Nigerian businesses. Help business owners craft replies that convert customers into buyers.

Nigerian market rules:
- Customers negotiate on price — handle this gracefully
- Trust and social proof close sales
- Responses must feel human, never robotic
- WhatsApp messages use natural line breaks, stay concise
- Never use dash bullet points
- Urgency works when it feels genuine

Industry: ${industryContext[industry] || industryContext.general}
Tone: ${toneGuide[tone] || toneGuide.friendly}

Return ONLY valid JSON. No markdown. No backticks. No explanation.`

  const userPrompt = `Business: ${businessName || 'Our Business'}
Product Info: ${productInfo}
${price ? `Price: ${price}` : ''}
${availability ? `Availability: ${availability}` : ''}${historyText}

Customer message: "${customerMessage}"

Return this exact JSON structure:
{
  "reply": "The WhatsApp reply to send. Natural line breaks. Sound human. Be concise.",
  "intent": "inquiry | price_objection | ready_to_buy | complaint | negotiating | just_browsing",
  "intent_label": "Human readable e.g. Customer is negotiating price",
  "conversion_probability": 0.0,
  "conversion_label": "LOW | MEDIUM | HIGH",
  "strategy_used": "One sentence on the sales strategy applied",
  "follow_up_tip": "One specific tip for what to do after sending this reply",
  "alternative_reply": "A shorter or differently toned alternative reply"
}`

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        temperature: 0.7,
        max_tokens: 1500,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('Groq error:', data)
      return res.status(500).json({ error: 'AI service error. Please try again.' })
    }

    const raw = data.choices?.[0]?.message?.content || ''
    const cleaned = raw.replace(/```json|```/g, '').trim()

    let parsed
    try {
      parsed = JSON.parse(cleaned)
    } catch {
      return res.status(500).json({ error: 'Could not parse AI response. Please try again.' })
    }

    return res.status(200).json(parsed)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Unexpected error. Please try again.' })
  }
}
