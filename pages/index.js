import { useState, useRef, useEffect } from 'react'
import Head from 'next/head'
import {
  MessageCircle, Copy, Check, RefreshCw, ChevronDown,
  Zap, TrendingUp, Shield, ArrowRight, RotateCcw,
  Target, Lightbulb, BarChart2, Send, Plus, X
} from 'lucide-react'

// ─── CONSTANTS ───────────────────────────────────────────────────────────────

const INDUSTRIES = [
  { id: 'fashion',     label: 'Fashion & Clothing',     hint: 'Clothing, shoes, accessories, fabric' },
  { id: 'food',        label: 'Food & Catering',        hint: 'Meals, snacks, catering, delivery' },
  { id: 'electronics', label: 'Electronics & Gadgets',  hint: 'Phones, gadgets, appliances' },
  { id: 'beauty',      label: 'Beauty & Skincare',      hint: 'Skincare, cosmetics, hair products' },
  { id: 'general',     label: 'Other Business',         hint: 'Services, retail, anything else' },
]

const TONES = [
  { id: 'friendly',   label: 'Friendly',   desc: 'Warm and approachable' },
  { id: 'premium',    label: 'Premium',    desc: 'Polished and professional' },
  { id: 'persuasive', label: 'Persuasive', desc: 'Conversion-focused' },
]

const CONVERSION_COLORS = {
  HIGH:   { bg: '#0D2E1A', border: '#1A5C34', text: '#4ADE80', dot: '#22C55E' },
  MEDIUM: { bg: '#2A1F00', border: '#5C4400', text: '#FCD34D', dot: '#F59E0B' },
  LOW:    { bg: '#2A0D0D', border: '#5C1A1A', text: '#FCA5A5', dot: '#EF4444' },
}

const SAMPLE_MESSAGES = [
  "How much is this? Can you do better on price?",
  "Is this available? I need it urgently",
  "What's the quality like? I've been burnt before",
  "I'm interested but the price is too high for me",
  "Do you do delivery? How long will it take?",
]

// ─── SMALL COMPONENTS ────────────────────────────────────────────────────────

function CopyBtn({ text, small }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button onClick={copy} style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: small ? '5px 10px' : '8px 14px',
      background: copied ? '#0D2E1A' : '#1A1A1A',
      border: `1px solid ${copied ? '#1A5C34' : '#2A2A2A'}`,
      borderRadius: 8, fontSize: 12, fontWeight: 600,
      color: copied ? '#4ADE80' : '#888',
      transition: 'all 0.2s',
    }}>
      {copied ? <Check size={12} /> : <Copy size={12} />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  )
}

function ConversionBar({ probability }) {
  const pct = Math.round((probability || 0) * 100)
  const color = pct >= 70 ? '#22C55E' : pct >= 40 ? '#F59E0B' : '#EF4444'
  return (
    <div style={{ width: '100%' }}>
      <div style={{ height: 6, background: '#1A1A1A', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{
          height: '100%', width: `${pct}%`, background: color,
          borderRadius: 3, transition: 'width 1s cubic-bezier(.4,0,.2,1)',
        }} />
      </div>
    </div>
  )
}

function WhatsAppBubble({ text, isCustomer }) {
  return (
    <div style={{
      display: 'flex', justifyContent: isCustomer ? 'flex-start' : 'flex-end',
      marginBottom: 10,
    }}>
      <div style={{
        maxWidth: '78%', padding: '10px 14px', borderRadius: isCustomer ? '4px 16px 16px 16px' : '16px 4px 16px 16px',
        background: isCustomer ? '#1E1E1E' : '#005C4B',
        fontSize: 14, lineHeight: 1.6, color: '#F0EDE8',
        whiteSpace: 'pre-wrap', wordBreak: 'break-word',
      }}>
        {text}
      </div>
    </div>
  )
}

// ─── SETUP PANEL ─────────────────────────────────────────────────────────────

function SetupPanel({ setup, setSetup, onComplete }) {
  const [errors, setErrors] = useState({})

  const validate = () => {
    const e = {}
    if (!setup.businessName.trim()) e.businessName = 'Required'
    if (!setup.industry) e.industry = 'Pick an industry'
    if (!setup.productInfo.trim()) e.productInfo = 'Required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  return (
    <div style={{ maxWidth: 560, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: '#111', border: '1px solid #222',
          borderRadius: 100, padding: '6px 16px', marginBottom: 24,
          fontSize: 12, fontWeight: 700, letterSpacing: 1, color: '#888',
          textTransform: 'uppercase',
        }}>
          <Zap size={11} color="#F97316" /> Setup — takes 60 seconds
        </div>
        <h1 style={{
          fontSize: 44, fontWeight: 900, lineHeight: 1.05,
          letterSpacing: -1.5, marginBottom: 14,
          background: 'linear-gradient(135deg, #F0EDE8 0%, #888 100%)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>
          Your AI sales desk.<br />Always open.
        </h1>
        <p style={{ color: '#555', fontSize: 16, lineHeight: 1.7 }}>
          Tell us about your business once. SellDesk will craft perfect WhatsApp replies that close sales — even while you sleep.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Business name */}
        <div>
          <label style={{ fontSize: 12, fontWeight: 700, color: '#666', letterSpacing: 0.8, textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
            Business Name
          </label>
          <input
            value={setup.businessName}
            onChange={e => setSetup(s => ({ ...s, businessName: e.target.value }))}
            placeholder="e.g. Adaeze Collections, Mama Put Catering..."
            style={{
              width: '100%', padding: '14px 16px',
              background: '#111', border: `1px solid ${errors.businessName ? '#5C1A1A' : '#222'}`,
              borderRadius: 12, fontSize: 15, color: '#F0EDE8',
              transition: 'border-color 0.2s',
            }}
            onFocus={e => e.target.style.borderColor = '#F97316'}
            onBlur={e => e.target.style.borderColor = errors.businessName ? '#5C1A1A' : '#222'}
          />
          {errors.businessName && <div style={{ fontSize: 12, color: '#EF4444', marginTop: 4 }}>{errors.businessName}</div>}
        </div>

        {/* Industry */}
        <div>
          <label style={{ fontSize: 12, fontWeight: 700, color: '#666', letterSpacing: 0.8, textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
            Industry
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {INDUSTRIES.map(ind => (
              <button
                key={ind.id}
                onClick={() => setSetup(s => ({ ...s, industry: ind.id }))}
                style={{
                  padding: '12px 16px', borderRadius: 10, textAlign: 'left',
                  background: setup.industry === ind.id ? '#1A1A0A' : '#111',
                  border: `1px solid ${setup.industry === ind.id ? '#F97316' : '#222'}`,
                  transition: 'all 0.2s',
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 700, color: setup.industry === ind.id ? '#F97316' : '#F0EDE8', marginBottom: 2 }}>{ind.label}</div>
                <div style={{ fontSize: 11, color: '#555' }}>{ind.hint}</div>
              </button>
            ))}
          </div>
          {errors.industry && <div style={{ fontSize: 12, color: '#EF4444', marginTop: 4 }}>{errors.industry}</div>}
        </div>

        {/* Product info */}
        <div>
          <label style={{ fontSize: 12, fontWeight: 700, color: '#666', letterSpacing: 0.8, textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
            What Do You Sell?
          </label>
          <textarea
            value={setup.productInfo}
            onChange={e => setSetup(s => ({ ...s, productInfo: e.target.value }))}
            placeholder="Describe your products or services. Include what makes you different, your best sellers, and anything customers often ask about..."
            rows={4}
            style={{
              width: '100%', padding: '14px 16px',
              background: '#111', border: `1px solid ${errors.productInfo ? '#5C1A1A' : '#222'}`,
              borderRadius: 12, fontSize: 14, lineHeight: 1.6, color: '#F0EDE8',
            }}
            onFocus={e => e.target.style.borderColor = '#F97316'}
            onBlur={e => e.target.style.borderColor = errors.productInfo ? '#5C1A1A' : '#222'}
          />
          {errors.productInfo && <div style={{ fontSize: 12, color: '#EF4444', marginTop: 4 }}>{errors.productInfo}</div>}
        </div>

        {/* Price & availability */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: '#666', letterSpacing: 0.8, textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
              Price Range <span style={{ color: '#333', fontWeight: 400 }}>(optional)</span>
            </label>
            <input
              value={setup.price}
              onChange={e => setSetup(s => ({ ...s, price: e.target.value }))}
              placeholder="e.g. ₦5,000 – ₦25,000"
              style={{ width: '100%', padding: '13px 16px', background: '#111', border: '1px solid #222', borderRadius: 12, fontSize: 14, color: '#F0EDE8' }}
              onFocus={e => e.target.style.borderColor = '#F97316'}
              onBlur={e => e.target.style.borderColor = '#222'}
            />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: '#666', letterSpacing: 0.8, textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
              Availability <span style={{ color: '#333', fontWeight: 400 }}>(optional)</span>
            </label>
            <input
              value={setup.availability}
              onChange={e => setSetup(s => ({ ...s, availability: e.target.value }))}
              placeholder="e.g. In stock, ships same day"
              style={{ width: '100%', padding: '13px 16px', background: '#111', border: '1px solid #222', borderRadius: 12, fontSize: 14, color: '#F0EDE8' }}
              onFocus={e => e.target.style.borderColor = '#F97316'}
              onBlur={e => e.target.style.borderColor = '#222'}
            />
          </div>
        </div>

        {/* Tone */}
        <div>
          <label style={{ fontSize: 12, fontWeight: 700, color: '#666', letterSpacing: 0.8, textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
            Brand Tone
          </label>
          <div style={{ display: 'flex', gap: 8 }}>
            {TONES.map(t => (
              <button
                key={t.id}
                onClick={() => setSetup(s => ({ ...s, tone: t.id }))}
                style={{
                  flex: 1, padding: '12px 8px', borderRadius: 10, textAlign: 'center',
                  background: setup.tone === t.id ? '#1A1A0A' : '#111',
                  border: `1px solid ${setup.tone === t.id ? '#F97316' : '#222'}`,
                  transition: 'all 0.2s',
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 700, color: setup.tone === t.id ? '#F97316' : '#F0EDE8', marginBottom: 2 }}>{t.label}</div>
                <div style={{ fontSize: 11, color: '#555' }}>{t.desc}</div>
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => { if (validate()) onComplete() }}
          style={{
            width: '100%', padding: '16px', borderRadius: 12,
            background: '#F97316', color: '#0D0D0D',
            fontSize: 15, fontWeight: 800, letterSpacing: 0.3,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            marginTop: 8, transition: 'opacity 0.2s',
          }}
          onMouseOver={e => e.currentTarget.style.opacity = '0.9'}
          onMouseOut={e => e.currentTarget.style.opacity = '1'}
        >
          Open My SellDesk <ArrowRight size={16} />
        </button>
      </div>
    </div>
  )
}

// ─── REPLY GENERATOR ─────────────────────────────────────────────────────────

function ReplyGenerator({ setup }) {
  const [customerMessage, setCustomerMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [conversation, setConversation] = useState([])
  const [showAlt, setShowAlt] = useState(false)
  const chatEndRef = useRef(null)

  useEffect(() => {
    if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: 'smooth' })
  }, [conversation, result])

  const generate = async (msg) => {
    const message = msg || customerMessage
    if (!message.trim()) return
    setLoading(true)
    setError('')
    setResult(null)
    setShowAlt(false)

    try {
      const res = await fetch('/api/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerMessage: message,
          businessName: setup.businessName,
          industry: setup.industry,
          productInfo: setup.productInfo,
          price: setup.price,
          availability: setup.availability,
          tone: setup.tone,
          previousMessages: conversation,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')
      setResult(data)
      setConversation(prev => [
        ...prev,
        { role: 'customer', text: message },
        { role: 'business', text: data.reply },
      ])
      setCustomerMessage('')
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const clearConversation = () => {
    setConversation([])
    setResult(null)
    setCustomerMessage('')
    setError('')
  }

  const convCfg = result ? CONVERSION_COLORS[result.conversion_label] || CONVERSION_COLORS.MEDIUM : null

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, height: 'calc(100vh - 120px)', maxHeight: 800 }}>

      {/* LEFT — Chat simulator */}
      <div style={{ display: 'flex', flexDirection: 'column', background: '#0A0A0A', border: '1px solid #1A1A1A', borderRadius: 16, overflow: 'hidden' }}>
        {/* Chat header */}
        <div style={{ padding: '14px 18px', borderBottom: '1px solid #1A1A1A', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#1A1A1A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MessageCircle size={16} color="#F97316" />
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700 }}>WhatsApp Simulator</div>
              <div style={{ fontSize: 11, color: '#555' }}>{setup.businessName}</div>
            </div>
          </div>
          {conversation.length > 0 && (
            <button onClick={clearConversation} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#555', padding: '5px 10px', border: '1px solid #1A1A1A', borderRadius: 6 }}>
              <RotateCcw size={11} /> Clear
            </button>
          )}
        </div>

        {/* Chat messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: conversation.length === 0 ? 'center' : 'flex-start' }}>
          {conversation.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#333' }}>
              <MessageCircle size={32} color="#222" style={{ marginBottom: 12 }} />
              <div style={{ fontSize: 13, marginBottom: 16 }}>Paste a customer message below to see SellDesk in action</div>
              <div style={{ fontSize: 11, color: '#2A2A2A', marginBottom: 10 }}>Try a sample:</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {SAMPLE_MESSAGES.map((m, i) => (
                  <button key={i} onClick={() => { setCustomerMessage(m); generate(m) }}
                    style={{ padding: '8px 12px', background: '#111', border: '1px solid #1A1A1A', borderRadius: 8, fontSize: 12, color: '#555', textAlign: 'left', transition: 'border-color 0.2s' }}
                    onMouseOver={e => e.currentTarget.style.borderColor = '#F97316'}
                    onMouseOut={e => e.currentTarget.style.borderColor = '#1A1A1A'}
                  >
                    "{m}"
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {conversation.map((msg, i) => (
                <WhatsAppBubble key={i} text={msg.text} isCustomer={msg.role === 'customer'} />
              ))}
              {loading && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 10 }}>
                  <div style={{ padding: '10px 14px', background: '#005C4B', borderRadius: '16px 4px 16px 16px', display: 'flex', gap: 4 }}>
                    {[0,1,2].map(i => (
                      <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ADE80', animation: 'bounce 1s ease infinite', animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </>
          )}
        </div>

        {/* Chat input */}
        <div style={{ padding: '12px 16px', borderTop: '1px solid #1A1A1A' }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
            <textarea
              value={customerMessage}
              onChange={e => setCustomerMessage(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); generate() } }}
              placeholder="Type a customer message..."
              rows={2}
              style={{
                flex: 1, padding: '10px 14px', background: '#111',
                border: '1px solid #222', borderRadius: 12,
                fontSize: 14, lineHeight: 1.5, color: '#F0EDE8',
                resize: 'none',
              }}
            />
            <button
              onClick={() => generate()}
              disabled={loading || !customerMessage.trim()}
              style={{
                width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                background: loading || !customerMessage.trim() ? '#1A1A1A' : '#F97316',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background 0.2s',
              }}
            >
              {loading
                ? <div style={{ width: 14, height: 14, border: '2px solid #333', borderTop: '2px solid #888', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                : <Send size={16} color={!customerMessage.trim() ? '#333' : '#0D0D0D'} />
              }
            </button>
          </div>
          {error && <div style={{ fontSize: 12, color: '#EF4444', marginTop: 8 }}>{error}</div>}
        </div>
      </div>

      {/* RIGHT — AI Analysis */}
      <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {!result ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0A0A0A', border: '1px solid #1A1A1A', borderRadius: 16 }}>
            <div style={{ textAlign: 'center', color: '#333', padding: 32 }}>
              <BarChart2 size={36} color="#1A1A1A" style={{ marginBottom: 12 }} />
              <div style={{ fontSize: 14 }}>Send a customer message to see the AI analysis</div>
            </div>
          </div>
        ) : (
          <>
            {/* Conversion score */}
            <div style={{ background: convCfg.bg, border: `1px solid ${convCfg.border}`, borderRadius: 16, padding: '18px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: convCfg.dot }} />
                  <span style={{ fontSize: 11, fontWeight: 700, color: convCfg.text, letterSpacing: 0.8, textTransform: 'uppercase' }}>
                    {result.conversion_label} Conversion Chance
                  </span>
                </div>
                <span style={{ fontSize: 20, fontWeight: 900, color: convCfg.text }}>
                  {Math.round((result.conversion_probability || 0) * 100)}%
                </span>
              </div>
              <ConversionBar probability={result.conversion_probability} />
              <div style={{ marginTop: 10, fontSize: 12, color: convCfg.text, opacity: 0.7 }}>{result.intent_label}</div>
            </div>

            {/* The reply */}
            <div style={{ background: '#0A0A0A', border: '1px solid #1A1A1A', borderRadius: 16, padding: '18px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#555', letterSpacing: 0.8, textTransform: 'uppercase' }}>Recommended Reply</div>
                <CopyBtn text={result.reply} small />
              </div>
              <div style={{ background: '#005C4B', borderRadius: 12, padding: '14px 16px', fontSize: 14, lineHeight: 1.7, whiteSpace: 'pre-wrap', wordBreak: 'break-word', color: '#F0EDE8' }}>
                {result.reply}
              </div>

              {/* Alt reply toggle */}
              <button
                onClick={() => setShowAlt(s => !s)}
                style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#555', transition: 'color 0.2s' }}
                onMouseOver={e => e.currentTarget.style.color = '#F97316'}
                onMouseOut={e => e.currentTarget.style.color = '#555'}
              >
                <RefreshCw size={11} /> {showAlt ? 'Hide' : 'Show'} alternative reply
              </button>

              {showAlt && result.alternative_reply && (
                <div style={{ marginTop: 10 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#444', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 8 }}>Alternative</div>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <div style={{ flex: 1, background: '#111', border: '1px solid #222', borderRadius: 10, padding: '12px 14px', fontSize: 13, lineHeight: 1.6, color: '#888', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                      {result.alternative_reply}
                    </div>
                    <CopyBtn text={result.alternative_reply} small />
                  </div>
                </div>
              )}
            </div>

            {/* Strategy */}
            <div style={{ background: '#0A0A0A', border: '1px solid #1A1A1A', borderRadius: 16, padding: '16px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <Target size={14} color="#F97316" />
                <div style={{ fontSize: 11, fontWeight: 700, color: '#555', letterSpacing: 0.8, textTransform: 'uppercase' }}>Sales Strategy Used</div>
              </div>
              <p style={{ fontSize: 14, color: '#888', lineHeight: 1.6 }}>{result.strategy_used}</p>
            </div>

            {/* Follow up tip */}
            <div style={{ background: '#0A0A0A', border: '1px solid #1A1A1A', borderRadius: 16, padding: '16px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <Lightbulb size={14} color="#F97316" />
                <div style={{ fontSize: 11, fontWeight: 700, color: '#555', letterSpacing: 0.8, textTransform: 'uppercase' }}>Your Next Move</div>
              </div>
              <p style={{ fontSize: 14, color: '#888', lineHeight: 1.6 }}>{result.follow_up_tip}</p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────

export default function SellDesk() {
  const [phase, setPhase] = useState('setup') // 'setup' | 'desk'
  const [setup, setSetup] = useState({
    businessName: '',
    industry: '',
    productInfo: '',
    price: '',
    availability: '',
    tone: 'friendly',
  })

  return (
    <>
      <Head>
        <title>SellDesk — WhatsApp Sales Assistant for Nigerian Businesses</title>
        <meta name="description" content="Stop losing WhatsApp customers. SellDesk uses AI to craft perfect sales replies that close deals — instantly." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
        <style>{`
          @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes spin { to { transform: rotate(360deg); } }
          @keyframes bounce { 0%,80%,100% { transform: scale(0); } 40% { transform: scale(1); } }
          .fade-up { animation: fadeUp 0.45s ease forwards; }
        `}</style>
      </Head>

      <div style={{ minHeight: '100vh', background: '#0D0D0D', fontFamily: 'DM Sans, sans-serif', color: '#F0EDE8' }}>

        {/* Nav */}
        <nav style={{
          position: 'sticky', top: 0, zIndex: 100,
          borderBottom: '1px solid #1A1A1A', padding: '0 28px',
          height: 58, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: '#0D0D0Dee', backdropFilter: 'blur(12px)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 30, height: 30, background: '#F97316', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MessageCircle size={15} color="#0D0D0D" />
            </div>
            <span style={{ fontWeight: 900, fontSize: 18, letterSpacing: -0.5 }}>SellDesk</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {phase === 'desk' && (
              <>
                <div style={{ fontSize: 13, color: '#444' }}>
                  {setup.businessName} · {INDUSTRIES.find(i => i.id === setup.industry)?.label}
                </div>
                <button
                  onClick={() => setPhase('setup')}
                  style={{ fontSize: 12, color: '#555', padding: '6px 12px', border: '1px solid #1A1A1A', borderRadius: 8 }}
                >
                  Edit Setup
                </button>
              </>
            )}
          </div>
        </nav>

        {/* Main content */}
        <main style={{ padding: phase === 'setup' ? '60px 24px' : '24px 24px', maxWidth: phase === 'setup' ? '100%' : 1200, margin: '0 auto' }}>
          <div className="fade-up">
            {phase === 'setup'
              ? <SetupPanel setup={setup} setSetup={setSetup} onComplete={() => setPhase('desk')} />
              : <ReplyGenerator setup={setup} />
            }
          </div>
        </main>
      </div>
    </>
  )
}
