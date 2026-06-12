'use client'

import { useState, useEffect } from 'react'
import { Loader, Activity, Search } from 'lucide-react'

interface AuditLog {
  id: number
  userId: number
  action: string
  entity: string
  entityId: string
  details: string | null
  createdAt: string
  user: {
    id: number
    name: string
    role: string
  }
}

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetch('/api/admin/audit-logs')
      .then(res => res.json())
      .then(data => {
        setLogs(Array.isArray(data) ? data : [])
        setLoading(false)
      })
  }, [])

  const filteredLogs = logs.filter(log => 
    log.user.name.toLowerCase().includes(search.toLowerCase()) ||
    log.action.toLowerCase().includes(search.toLowerCase()) ||
    log.entity.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#1A2332', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Activity size={24} color="#6D28D9" /> Audit Logs
          </h1>
          <p style={{ color: '#8B98A9', fontSize: '0.9rem' }}>Rekam jejak aktivitas krusial di sistem</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <div style={{ position: 'relative', flex: '1', maxWidth: '400px' }}>
          <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#8B98A9' }} />
          <input
            type="text"
            placeholder="Cari user, aksi, atau entitas..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', padding: '10px 14px 10px 36px', borderRadius: '12px', border: '1.5px solid #E5E9F0', fontSize: '0.875rem', fontFamily: 'Outfit, sans-serif', outline: 'none' }}
          />
        </div>
      </div>

      <div style={{ background: 'white', borderRadius: '20px', border: '1px solid #E5E9F0', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#8B98A9' }}>
            <Loader size={32} style={{ animation: 'spin 1s linear infinite' }} />
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E5E9F0' }}>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.75rem', color: '#8B98A9', textTransform: 'uppercase' }}>Waktu</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.75rem', color: '#8B98A9', textTransform: 'uppercase' }}>User</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.75rem', color: '#8B98A9', textTransform: 'uppercase' }}>Aksi</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.75rem', color: '#8B98A9', textTransform: 'uppercase' }}>Target Entitas</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.75rem', color: '#8B98A9', textTransform: 'uppercase' }}>Detail</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map(log => (
                <tr key={log.id} style={{ borderBottom: '1px solid #F0F4F8' }} className="table-row">
                  <td style={{ padding: '12px 16px', fontSize: '0.8rem', color: '#4A5568', whiteSpace: 'nowrap' }}>
                    {new Date(log.createdAt).toLocaleString('id-ID')}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#1A2332' }}>{log.user.name}</div>
                    <div style={{ fontSize: '0.7rem', color: '#8B98A9', textTransform: 'capitalize' }}>Role: {log.user.role}</div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ 
                      fontSize: '0.75rem', fontWeight: 700, padding: '4px 8px', borderRadius: '6px', 
                      background: log.action.includes('DELETE') ? '#FEE2E2' : log.action.includes('UPDATE') || log.action.includes('TOGGLE') ? '#FEF3C7' : '#E0F2FE',
                      color: log.action.includes('DELETE') ? '#DC2626' : log.action.includes('UPDATE') || log.action.includes('TOGGLE') ? '#D97706' : '#0A4A5E'
                    }}>
                      {log.action}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '0.8rem', color: '#4A5568' }}>
                    <strong>{log.entity}</strong> <span style={{ color: '#8B98A9' }}>#{log.entityId}</span>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '0.75rem', color: '#8B98A9', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {log.details || '-'}
                  </td>
                </tr>
              ))}
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: '#8B98A9' }}>Tidak ada log ditemukan</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .table-row:hover { background: #F8FAFC; }
      `}</style>
    </div>
  )
}
