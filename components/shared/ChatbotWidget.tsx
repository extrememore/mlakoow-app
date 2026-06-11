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
        setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', content: `**Error:** ${data.error}` }])
      } else {
        setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', content: data.reply }])
      }
    } catch (err) {
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', content: 'Maaf, sistem sedang sibuk. Coba lagi nanti ya!' }])
    } finally {
      setIsLoading(false)
    }
  }

  // Parse message content to replace [DESTINATION:ID] with the BotDestinationCard component
  const renderMessageContent = (content: string) => {
    const parts = content.split(/(\[DESTINATION:\d+\])/g)
    
    return parts.map((part, index) => {
      const match = part.match(/\[DESTINATION:(\d+)\]/)
      if (match) {
        const destId = parseInt(match[1])
        return <BotDestinationCard key={index} id={destId} />
      }
      return (
        <div key={index} className="prose prose-sm prose-p:leading-relaxed prose-a:text-[#FF6B35] max-w-none">
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
        <div className="fixed bottom-24 right-6 w-[350px] sm:w-[380px] h-[550px] max-h-[calc(100vh-120px)] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden z-50 border border-gray-100 font-sans animate-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="bg-[#0A4A5E] p-4 text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
              <Sparkles size={20} className="text-yellow-400" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight flex items-center gap-2">
                Tanya Mlaky <span className="text-[10px] bg-[#FF6B35] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">Beta</span>
              </h3>
              <p className="text-xs text-white/70">AI Travel Assistant Surabaya</p>
            </div>
            <button onClick={() => setIsOpen(false)} className="ml-auto text-white/70 hover:text-white">
              <X size={20} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 bg-[#F8F9FA] flex flex-col gap-4">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-gray-200 text-gray-600' : 'bg-gradient-to-br from-[#FF6B35] to-[#E5522A] text-white'}`}>
                  {msg.role === 'user' ? <User size={16} /> : <Sparkles size={16} />}
                </div>
                <div className={`max-w-[80%] rounded-2xl p-3 ${msg.role === 'user' ? 'bg-[#0A4A5E] text-white rounded-tr-sm' : 'bg-white border border-gray-100 shadow-sm text-gray-800 rounded-tl-sm'}`}>
                  {msg.role === 'user' ? (
                    <p className="text-sm">{msg.content}</p>
                  ) : (
                    <div className="text-sm">
                      {renderMessageContent(msg.content)}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3 flex-row">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FF6B35] to-[#E5522A] text-white flex items-center justify-center shrink-0">
                  <Sparkles size={16} />
                </div>
                <div className="bg-white border border-gray-100 shadow-sm text-gray-800 rounded-2xl rounded-tl-sm p-3">
                  <Loader2 size={16} className="animate-spin text-gray-400" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 bg-white border-t border-gray-100 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Tanya rekomendasi wisata..."
              className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:border-[#FF6B35] focus:ring-1 focus:ring-[#FF6B35] transition-all"
              disabled={isLoading}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="w-10 h-10 bg-[#FF6B35] rounded-full flex items-center justify-center text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#E5522A] transition-colors shrink-0"
            >
              <Send size={18} className="ml-1" />
            </button>
          </div>
        </div>
      )}
    </>
  )
}
