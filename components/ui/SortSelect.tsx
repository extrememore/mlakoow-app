'use client'

import { Filter } from 'lucide-react'

export default function SortSelect({ defaultValue }: { defaultValue: string }) {
  return (
    <div style={{ position: 'relative' }}>
      <Filter size={16} color="#8B98A9" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
      <select 
        name="sort" 
        defaultValue={defaultValue} 
        onChange={(e) => e.target.form?.submit()} 
        style={{ 
          padding: '1rem 1.5rem 1rem 2.5rem', 
          borderRadius: '16px', 
          border: '1px solid #E5E9F0', 
          fontSize: '0.95rem', 
          fontFamily: 'Outfit, sans-serif', 
          background: '#F8FAFC', 
          fontWeight: 600, 
          color: '#1A2332', 
          cursor: 'pointer', 
          appearance: 'none', 
          paddingRight: '2.5rem' 
        }}
      >
        <option value="Terdekat">Urutkan: Terdekat</option>
        <option value="Termurah">Urutkan: Termurah</option>
        <option value="Termahal">Urutkan: Termahal</option>
        <option value="Gratis">Urutkan: Gratis Saja</option>
      </select>
      <div style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
        <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 1.5L6 6.5L11 1.5" stroke="#8B98A9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </div>
    </div>
  )
}
