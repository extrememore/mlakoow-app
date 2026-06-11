import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { prisma } from '@/lib/prisma'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export async function POST(req: NextRequest) {
  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json(
      { error: 'API Key Gemini belum disetting di .env (GEMINI_API_KEY)' },
      { status: 500 }
    )
  }

  try {
    const { messages } = await req.json()

    // Ambil data destinasi ringkas dari database untuk konteks AI
    // Kita hanya mengambil yang penting agar tidak memakan token terlalu banyak
    const destinations = await prisma.destination.findMany({
      select: {
        id: true,
        name: true,
        area: true,
        ticketPrice: true,
        category: { select: { name: true } }
      },
      orderBy: { rating: 'desc' }
    })

    const contextData = destinations.map(d => 
      `- ID: ${d.id} | Nama: ${d.name} | Kategori: ${d.category?.name} | Area: ${d.area} | Harga Tiket: Rp${d.ticketPrice.toLocaleString('id-ID')}`
    ).join('\n')

    const systemPrompt = `Kamu adalah "Tanya Mlaky", asisten travel virtual khusus untuk wisata di kota Surabaya buatan MLAKOOW. 
Tugasmu adalah membantu wisatawan merencanakan perjalanan, menjawab pertanyaan seputar wisata Surabaya, dan memberikan rekomendasi tempat wisata atau kuliner.
Gunakan gaya bahasa santai, ramah, dan informatif ala anak muda Surabaya (bisa pakai sedikit kata khas Suroboyoan seperti "Rek", "Cak", tapi tetap sopan).

Berikut adalah daftar database destinasi yang tersedia di sistem MLAKOOW saat ini:
${contextData}

ATURAN PENTING SAAT MEMBERIKAN REKOMENDASI:
Jika kamu merekomendasikan suatu tempat spesifik yang ada di database di atas, kamu WAJIB menyisipkan tag berikut persis di posisi kamu menyebutkan namanya: [DESTINATION:ID]. 
Contoh: "Kalau kamu cari tempat sejarah, aku sangat merekomendasikan [DESTINATION:12] karena tempatnya sejuk."
Sistem *frontend* akan otomatis mengubah tag [DESTINATION:ID] tersebut menjadi kartu interaktif. Jangan merender markdown image manual untuk destinasi, cukup gunakan tag tersebut.
Kamu bisa merekomendasikan 1-3 tempat sekaligus. Jangan rekomendasikan tempat yang tidak ada di database jika user meminta rekomendasi dalam sistem, tapi jika user bertanya hal umum di Surabaya, jawab saja sewajarnya.

Format output gunakan Markdown biasa (bold, italic, list).`

    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash-latest',
      systemInstruction: systemPrompt 
    })

    let chatHistory = messages.slice(0, -1).map((m: any) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }]
    }))

    if (chatHistory.length > 0 && chatHistory[0].role === 'model') {
      chatHistory.shift()
    }

    const chat = model.startChat({
      history: chatHistory,
      generationConfig: {
        maxOutputTokens: 800,
        temperature: 0.7,
      }
    })

    const latestMessage = messages[messages.length - 1].content
    const result = await chat.sendMessage(latestMessage)
    const response = await result.response

    return NextResponse.json({ reply: response.text() })
  } catch (error: any) {
    console.error('Chat API Error:', error)
    return NextResponse.json(
      { error: `Terjadi kesalahan pada asisten AI: ${error.message || String(error)}` },
      { status: 500 }
    )
  }
}
