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
    // Split by the tag, including any surrounding asterisks or spaces the AI might add
    const parts = content.split(/(\**\s*\[DESTINATION:\d+\]\s*\**)/g)
    
    return parts.map((part, index) => {
      const match = part.match(/\[DESTINATION:(\d+)\]/)
      if (match) {
        const destId = parseInt(match[1])
        return <BotDestinationCard key={index} id={destId} />
      }
      if (!part.trim()) return null
      
      return (
        <div key={index} className="prose prose-sm prose-p:leading-relaxed prose-p:my-1 prose-ul:my-1 prose-li:my-0 prose-a:text-[#FF6B35] max-w-none">
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
          <div className="bg-[#0A4A5E] p-4 sm:p-5 text-white flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-md shadow-inner">
              <Sparkles size={22} className="text-yellow-400" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight flex items-center">
                Tanya Mlaky 
                <span className="ml-2 text-[10px] bg-gradient-to-r from-[#FF6B35] to-[#E5522A] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold shadow-sm">
                  Beta
                </span>
              </h3>
              <p className="text-[13px] text-white/80 mt-0.5">AI Travel Assistant Surabaya</p>
            </div>
            <button onClick={() => setIsOpen(false)} className="ml-auto text-white/70 hover:text-white transition-colors bg-white/10 hover:bg-white/20 p-2 rounded-full">
              <X size={18} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 bg-[#F8F9FA] flex flex-col gap-6">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm ${msg.role === 'user' ? 'bg-white border border-gray-200 text-[#0A4A5E]' : 'bg-gradient-to-br from-[#FF6B35] to-[#E5522A] text-white'}`}>
                  {msg.role === 'user' ? <User size={16} /> : <Sparkles size={16} />}
                </div>
                <div className={`max-w-[85%] sm:max-w-[80%] rounded-2xl px-5 py-3.5 break-words ${msg.role === 'user' ? 'bg-[#0A4A5E] text-white rounded-tr-sm shadow-md' : 'bg-white border border-gray-200 shadow-sm text-gray-800 rounded-tl-sm'}`}>
                  {msg.role === 'user' ? (
                    <p className="text-[15px] leading-relaxed">{msg.content}</p>
                  ) : (
                    <div className="text-[15px] leading-relaxed flex flex-col gap-2">
                      {renderMessageContent(msg.content)}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3 flex-row animate-pulse">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FF6B35] to-[#E5522A] text-white flex items-center justify-center shrink-0 shadow-sm">
                  <Sparkles size={16} />
                </div>
                <div className="bg-white border border-gray-200 shadow-sm text-gray-800 rounded-2xl rounded-tl-sm px-5 py-3.5">
                  <Loader2 size={18} className="animate-spin text-[#FF6B35]" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-gray-100 flex gap-3 shadow-[0_-4px_20px_-15px_rgba(0,0,0,0.1)]">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Tanya rekomendasi wisata..."
              className="flex-1 bg-gray-50/50 border border-gray-200 rounded-full px-5 py-3 text-[15px] focus:outline-none focus:border-[#0A4A5E] focus:ring-1 focus:ring-[#0A4A5E] transition-all placeholder:text-gray-400 shadow-inner"
              disabled={isLoading}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="w-12 h-12 bg-[#0A4A5E] rounded-full flex items-center justify-center text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#062E3A] hover:scale-105 active:scale-95 transition-all shrink-0 shadow-md"
            >
              <Send size={18} className="ml-0.5" />
            </button>
          </div>
        </div>
      )}
    </>
  )
}
