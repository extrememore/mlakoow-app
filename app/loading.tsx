import { Loader } from 'lucide-react'

export default function Loading() {
  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(255, 255, 255, 0.8)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      flexDirection: 'column',
      gap: '12px'
    }}>
      <div style={{
        background: 'white',
        padding: '24px',
        borderRadius: '20px',
        boxShadow: '0 10px 40px rgba(10, 74, 94, 0.15)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Loader size={36} color="#FF6B35" style={{ animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
      <div style={{ color: '#0A4A5E', fontWeight: 700, fontSize: '0.95rem' }}>Memuat...</div>
    </div>
  )
}
