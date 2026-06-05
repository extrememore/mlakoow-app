'use client'

import dynamic from 'next/dynamic'

const AdminMapPicker = dynamic(() => import('./AdminMapPicker'), {
  ssr: false,
  loading: () => (
    <div style={{ height: '300px', background: '#F0F4F8', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8B98A9' }}>
      🗺️ Memuat peta interaktif...
    </div>
  ),
})

export default AdminMapPicker
