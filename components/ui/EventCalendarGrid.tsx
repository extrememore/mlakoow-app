'use client'

import { useState, useMemo, useEffect } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'

type MinimalEvent = {
  id: number
  startDate: Date
  endDate: Date
  category: string
}

export default function EventCalendarGrid({ events }: { events: MinimalEvent[] }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()

  const dateParam = searchParams.get('date')
  const initialDate = dateParam ? new Date(dateParam) : new Date()

  const [currentMonth, setCurrentMonth] = useState(new Date(initialDate.getFullYear(), initialDate.getMonth(), 1))

  // Update current month if URL date changes
  useEffect(() => {
    if (dateParam) {
      const d = new Date(dateParam)
      if (!isNaN(d.getTime())) {
        setCurrentMonth(new Date(d.getFullYear(), d.getMonth(), 1))
      }
    }
  }, [dateParam])

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate()
  }

  const daysInMonth = getDaysInMonth(currentMonth.getFullYear(), currentMonth.getMonth())
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay()
  const daysInPrevMonth = getDaysInMonth(currentMonth.getFullYear(), currentMonth.getMonth() - 1)

  const days = useMemo(() => {
    const calendarDays = []
    
    // Previous month padding
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      calendarDays.push({
        day: daysInPrevMonth - i,
        month: currentMonth.getMonth() - 1,
        year: currentMonth.getFullYear(),
        isCurrentMonth: false,
      })
    }

    // Current month
    for (let i = 1; i <= daysInMonth; i++) {
      calendarDays.push({
        day: i,
        month: currentMonth.getMonth(),
        year: currentMonth.getFullYear(),
        isCurrentMonth: true,
      })
    }

    // Next month padding to complete the grid (usually up to 42 cells)
    const remainingCells = 42 - calendarDays.length
    for (let i = 1; i <= remainingCells; i++) {
      calendarDays.push({
        day: i,
        month: currentMonth.getMonth() + 1,
        year: currentMonth.getFullYear(),
        isCurrentMonth: false,
      })
    }

    return calendarDays
  }, [currentMonth, daysInMonth, firstDayOfMonth, daysInPrevMonth])

  // Check if a given calendar day has an event
  const hasEvent = (year: number, month: number, day: number) => {
    const targetDate = new Date(year, month, day)
    targetDate.setHours(0, 0, 0, 0)
    
    return events.some(e => {
      const start = new Date(e.startDate)
      start.setHours(0, 0, 0, 0)
      const end = new Date(e.endDate)
      end.setHours(23, 59, 59, 999)
      
      return targetDate >= start && targetDate <= end
    })
  }

  const handleDayClick = (year: number, month: number, day: number) => {
    // Format to YYYY-MM-DD
    const d = new Date(year, month, day)
    const yearStr = d.getFullYear()
    const monthStr = String(d.getMonth() + 1).padStart(2, '0')
    const dayStr = String(d.getDate()).padStart(2, '0')
    const formattedDate = `${yearStr}-${monthStr}-${dayStr}`

    const params = new URLSearchParams(searchParams.toString())
    if (params.get('date') === formattedDate) {
      // If clicking already selected date, toggle off (remove filter)
      params.delete('date')
    } else {
      params.set('date', formattedDate)
    }
    
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }

  const clearDateFilter = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('date')
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }

  const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
  const weekDays = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']

  return (
    <div style={{ background: 'white', borderRadius: '24px', boxShadow: '0 10px 40px rgba(10,74,94,0.1)', padding: '1.5rem', marginBottom: '3rem', border: '1px solid rgba(229,233,240,0.8)' }}>
      {/* Header Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1A2332', display: 'flex', alignItems: 'center', gap: '10px' }}>
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h2>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={prevMonth} style={{ padding: '8px', borderRadius: '50%', border: '1px solid #E5E9F0', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ChevronLeft size={20} color="#4A5568" />
          </button>
          <button onClick={nextMonth} style={{ padding: '8px', borderRadius: '50%', border: '1px solid #E5E9F0', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ChevronRight size={20} color="#4A5568" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', textAlign: 'center' }}>
        {/* Days of week header */}
        {weekDays.map(day => (
          <div key={day} style={{ fontSize: '0.8rem', fontWeight: 700, color: '#8B98A9', paddingBottom: '8px' }}>
            {day}
          </div>
        ))}

        {/* Days grid */}
        {days.map((dayObj, index) => {
          const hasEvt = hasEvent(dayObj.year, dayObj.month, dayObj.day)
          
          const d = new Date(dayObj.year, dayObj.month, dayObj.day)
          const isSelected = dateParam === `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
          
          const isToday = new Date().toDateString() === d.toDateString()

          return (
            <button
              key={index}
              onClick={() => handleDayClick(dayObj.year, dayObj.month, dayObj.day)}
              style={{
                aspectRatio: '1',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '12px',
                border: isSelected ? '2px solid #0A4A5E' : '2px solid transparent',
                background: isSelected ? '#E0F2FE' : (hasEvt && !isSelected) ? '#F8FAFC' : 'transparent',
                color: dayObj.isCurrentMonth ? (isToday ? '#FF6B35' : '#1A2332') : '#CBD5E1',
                fontWeight: isToday || isSelected ? 800 : 600,
                fontSize: '1rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
                position: 'relative'
              }}
              className="calendar-day-btn"
            >
              {dayObj.day}
              {/* Event Indicator Dot */}
              {hasEvt && (
                <div style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: isSelected ? '#0A4A5E' : '#FF6B35',
                  position: 'absolute',
                  bottom: '8px'
                }} />
              )}
            </button>
          )
        })}
      </div>

      {dateParam && (
        <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #E5E9F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.9rem', color: '#4A5568', fontWeight: 600 }}>
            Menampilkan event pada: <span style={{ color: '#0A4A5E', fontWeight: 800 }}>{new Date(dateParam).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
          </span>
          <button 
            onClick={clearDateFilter}
            style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', color: '#B91C1C', background: '#FEE2E2', padding: '6px 12px', borderRadius: '50px', border: 'none', cursor: 'pointer', fontWeight: 600 }}
          >
            <X size={14} /> Hapus Filter Tanggal
          </button>
        </div>
      )}

      <style>{`
        .calendar-day-btn:hover {
          background: #E0F2FE !important;
        }
      `}</style>
    </div>
  )
}
