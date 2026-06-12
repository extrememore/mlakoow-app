'use client'

import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Sparkles, User, Loader2 } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import BotDestinationCard from '@/components/ui/BotDestinationCard'

type Message = {
  id: string
  role: 'user' | 'model'
  content: string
}

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'model',
      content: 'Halo Rek! Aku Mlaky, asisten travel pribadimu di Surabaya. Ada yang bisa dibantu? Mau cari tempat makan enak atau wisata seru?'
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isOpen])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return
    
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input.trim() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setIsLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMsg] })
      })
      
      const data = await res.json()
      
      if (data.error) {
        setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', content: `**Oops!** ${data.error}` }])
      } else {
        setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', content: data.reply }])
      }
    } catch {
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', content: 'Maaf, sistem sedang sibuk. Coba lagi nanti ya!' }])
    } finally {
      setIsLoading(false)
    }
  }

  const renderMessageContent = (content: string) => {
    const parts = content.split(/(\**\s*\[DESTINATION:\d+\]\s*\**)/g)
    
    return parts.map((part, index) => {
      const match = part.match(/\[DESTINATION:(\d+)\]/)
      if (match) {
        return <BotDestinationCard key={index} id={parseInt(match[1])} />
      }
      if (!part.trim()) return null
      return (
        <div key={index} style={{ lineHeight: '1.65' }}>
          <ReactMarkdown>{part}</ReactMarkdown>
        </div>
      )
    })
  }

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-[#FF6B35] to-[#E5522A] rounded-full shadow-xl flex items-center justify-center text-white hover:scale-110 transition-transform z-50 group"
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={26} />}
        {!isOpen && (
          <div className="absolute -top-1 -right-1 bg-yellow-400 p-1 rounded-full animate-pulse">
            <Sparkles size={12} className="text-yellow-900" />
          </div>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: '96px',
            right: '24px',
            width: '370px',
            maxWidth: 'calc(100vw - 32px)',
            height: '560px',
            maxHeight: 'calc(100vh - 120px)',
            backgroundColor: '#ffffff',
            borderRadius: '20px',
            boxShadow: '0 25px 60px rgba(0,0,0,0.18)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            zIndex: 50,
            border: '1px solid #E5E9F0',
            fontFamily: "'Outfit', sans-serif",
          }}
        >
          {/* Header */}
          <div
            style={{
              background: 'linear-gradient(135deg, #0A4A5E 0%, #0d5a72 100%)',
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              flexShrink: 0,
            }}
          >
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                backdropFilter: 'blur(8px)',
              }}
            >
              <Sparkles size={22} color="#FBBF24" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ color: '#fff', fontWeight: 700, fontSize: '17px', margin: 0, lineHeight: 1.2 }}>
                  Tanya Mlaky
                </h3>
                <span
                  style={{
                    fontSize: '10px',
                    background: 'linear-gradient(135deg, #FF6B35, #E5522A)',
                    color: '#fff',
                    padding: '2px 8px',
                    borderRadius: '20px',
                    fontWeight: 700,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    boxShadow: '0 2px 6px rgba(229,82,42,0.4)',
                  }}
                >
                  Beta
                </span>
              </div>
              <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '13px', margin: '3px 0 0 0' }}>
                AI Travel Assistant Surabaya
              </p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: 'rgba(255,255,255,0.15)',
                border: 'none',
                borderRadius: '50%',
                width: '34px',
                height: '34px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'rgba(255,255,255,0.85)',
                transition: 'background 0.2s',
                flexShrink: 0,
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.25)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')}
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages Area */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '20px 16px',
              background: '#F4F6F8',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
            }}
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  gap: '10px',
                  flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                  alignItems: 'flex-start',
                }}
              >
                {/* Avatar */}
                <div
                  style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '50%',
                    background: msg.role === 'user'
                      ? '#ffffff'
                      : 'linear-gradient(135deg, #FF6B35, #E5522A)',
                    border: msg.role === 'user' ? '1.5px solid #E5E9F0' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  }}
                >
                  {msg.role === 'user'
                    ? <User size={16} color="#0A4A5E" />
                    : <Sparkles size={16} color="#fff" />
                  }
                </div>

                {/* Bubble */}
                <div
                  style={{
                    maxWidth: '82%',
                    borderRadius: msg.role === 'user' ? '18px 4px 18px 18px' : '4px 18px 18px 18px',
                    padding: '12px 16px',
                    fontSize: '14.5px',
                    lineHeight: '1.65',
                    wordBreak: 'break-word',
                    ...(msg.role === 'user'
                      ? {
                          background: 'linear-gradient(135deg, #0A4A5E, #0d5a72)',
                          color: '#ffffff',
                          boxShadow: '0 3px 10px rgba(10,74,94,0.25)',
                        }
                      : {
                          background: '#ffffff',
                          color: '#1A2332',
                          border: '1px solid #E5E9F0',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                        }
                    ),
                  }}
                >
                  {msg.role === 'user' ? (
                    <p style={{ margin: 0 }}>{msg.content}</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {renderMessageContent(msg.content)}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Loading indicator */}
            {isLoading && (
              <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <div
                  style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #FF6B35, #E5522A)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  }}
                >
                  <Sparkles size={16} color="#fff" />
                </div>
                <div
                  style={{
                    background: '#ffffff',
                    border: '1px solid #E5E9F0',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                    borderRadius: '4px 18px 18px 18px',
                    padding: '14px 18px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Loader2 size={18} color="#FF6B35" style={{ animation: 'spin 1s linear infinite' }} />
                  <span style={{ fontSize: '13px', color: '#8B98A9' }}>Mlaky lagi mikir...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div
            style={{
              padding: '14px 16px',
              background: '#ffffff',
              borderTop: '1px solid #EEF1F5',
              display: 'flex',
              gap: '10px',
              alignItems: 'center',
              boxShadow: '0 -4px 20px rgba(0,0,0,0.05)',
              flexShrink: 0,
            }}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Tanya rekomendasi wisata..."
              disabled={isLoading}
              style={{
                flex: 1,
                background: '#F4F6F8',
                border: '1.5px solid #E5E9F0',
                borderRadius: '50px',
                padding: '11px 20px',
                fontSize: '14.5px',
                color: '#1A2332',
                outline: 'none',
                fontFamily: "'Outfit', sans-serif",
                transition: 'border-color 0.2s',
              }}
              onFocus={e => (e.target.style.borderColor = '#0A4A5E')}
              onBlur={e => (e.target.style.borderColor = '#E5E9F0')}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #0A4A5E, #0d5a72)',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                cursor: input.trim() && !isLoading ? 'pointer' : 'not-allowed',
                opacity: input.trim() && !isLoading ? 1 : 0.45,
                flexShrink: 0,
                boxShadow: '0 4px 12px rgba(10,74,94,0.3)',
                transition: 'opacity 0.2s, transform 0.15s',
              }}
              onMouseEnter={e => { if (input.trim() && !isLoading) e.currentTarget.style.transform = 'scale(1.07)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)' }}
            >
              <Send size={18} style={{ marginLeft: '2px' }} />
            </button>
          </div>
        </div>
      )}
    </>
  )
}
