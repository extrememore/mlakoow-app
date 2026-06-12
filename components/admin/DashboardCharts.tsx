'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'

interface DashboardChartsProps {
  bookingTrends: { name: string; total: number }[]
  categoryDistribution: { name: string; value: number }[]
}

const COLORS = ['#0A4A5E', '#FF6B35', '#7C3AED', '#059669', '#F59E0B', '#DC2626', '#3B82F6']

export default function DashboardCharts({ bookingTrends, categoryDistribution }: DashboardChartsProps) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
      
      {/* Bar Chart: Tren Pemesanan */}
      <div style={{ background: 'white', borderRadius: '20px', padding: '1.5rem', border: '1px solid #E5E9F0' }}>
        <h2 style={{ fontWeight: 800, fontSize: '1rem', color: '#1A2332', marginBottom: '1.25rem' }}>📈 Tren Pemesanan (6 Bulan Terakhir)</h2>
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer>
            <BarChart data={bookingTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E9F0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#8B98A9' }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#8B98A9' }} />
              <Tooltip 
                cursor={{ fill: '#F8FAFC' }}
                contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
              />
              <Bar dataKey="total" fill="#0A4A5E" radius={[6, 6, 0, 0]} barSize={40} name="Total Tiket" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Pie Chart: Distribusi Kategori */}
      <div style={{ background: 'white', borderRadius: '20px', padding: '1.5rem', border: '1px solid #E5E9F0' }}>
        <h2 style={{ fontWeight: 800, fontSize: '1rem', color: '#1A2332', marginBottom: '1.25rem' }}>📊 Destinasi per Kategori</h2>
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={categoryDistribution}
                cx="50%"
                cy="45%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {categoryDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
              />
              <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', color: '#4A5568' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  )
}
