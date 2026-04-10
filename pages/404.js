import Link from 'next/link'
export default function NotFound() {
  return (
    <div style={{ minHeight: '100vh', background: '#0D0D0D', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'DM Sans, sans-serif', color: '#F0EDE8' }}>
      <div style={{ fontSize: 80, fontWeight: 900, color: '#1A1A1A' }}>404</div>
      <p style={{ color: '#555', marginBottom: 24 }}>This page does not exist.</p>
      <Link href="/" style={{ background: '#F97316', color: '#0D0D0D', padding: '12px 24px', borderRadius: 10, fontSize: 14, fontWeight: 700 }}>Back to SellDesk</Link>
    </div>
  )
}
