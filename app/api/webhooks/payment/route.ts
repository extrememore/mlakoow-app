import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    
    // Validate signature key
    const serverKey = process.env.MIDTRANS_SERVER_KEY || 'SB-Mid-server-YOUR_SERVER_KEY'
    const { order_id, status_code, gross_amount, signature_key, transaction_status, fraud_status } = body

    const hash = crypto.createHash('sha512').update(order_id + status_code + gross_amount + serverKey).digest('hex')
    
    if (hash !== signature_key) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    let bookingStatus = 'pending'

    if (transaction_status == 'capture') {
      if (fraud_status == 'challenge') {
        bookingStatus = 'pending' // need manual review
      } else if (fraud_status == 'accept') {
        bookingStatus = 'paid'
      }
    } else if (transaction_status == 'settlement') {
      bookingStatus = 'paid'
    } else if (transaction_status == 'cancel' ||
      transaction_status == 'deny' ||
      transaction_status == 'expire') {
      bookingStatus = 'expired'
    } else if (transaction_status == 'pending') {
      bookingStatus = 'pending'
    }

    if (bookingStatus === 'paid') {
      await prisma.booking.update({
        where: { bookingCode: order_id },
        data: { 
          status: 'paid',
          paidAt: new Date()
        }
      })
    } else if (bookingStatus === 'expired') {
       await prisma.booking.update({
        where: { bookingCode: order_id },
        data: { 
          status: 'expired'
        }
      })
    }

    return NextResponse.json({ status: 'OK' })

  } catch (error: any) {
    console.error('Webhook Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
