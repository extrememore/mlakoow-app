import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

const midtransClient = require('midtrans-client')

const snap = new midtransClient.Snap({
  isProduction: false,
  serverKey: process.env.MIDTRANS_SERVER_KEY || 'SB-Mid-server-YOUR_SERVER_KEY',
  clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || 'SB-Mid-client-YOUR_CLIENT_KEY'
})

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } })
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const { destinationId, visitDate, ticketCount, paymentMethod } = await req.json()

    if (!destinationId || !visitDate || !ticketCount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const destination = await prisma.destination.findUnique({ where: { id: destinationId } })
    if (!destination) {
      return NextResponse.json({ error: 'Destination not found' }, { status: 404 })
    }

    const subtotal = destination.ticketPrice * ticketCount
    const serviceFee = subtotal > 0 ? Math.round(subtotal * 0.02) : 0
    const total = subtotal + serviceFee

    const bookingCode = 'BK-' + Date.now() + '-' + Math.floor(Math.random() * 1000)

    const booking = await prisma.booking.create({
      data: {
        userId: user.id,
        destinationId,
        visitDate: new Date(visitDate),
        ticketCount,
        totalPrice: total,
        status: 'pending',
        bookingCode,
        paymentMethod
      }
    })

    // Map internal payment method IDs to Midtrans payment types
    let enabledPayments: string[] = []
    switch (paymentMethod) {
      case 'transfer_bca': enabledPayments = ['bca_va']; break
      case 'transfer_mandiri': enabledPayments = ['echannel', 'mandiri_va']; break
      case 'transfer_bri': enabledPayments = ['bri_va']; break
      case 'gopay': enabledPayments = ['gopay']; break
      case 'ovo': enabledPayments = ['other_qris']; break 
      case 'qris': enabledPayments = ['qris']; break
      case 'visa': enabledPayments = ['credit_card']; break
      default: enabledPayments = ['bca_va', 'mandiri_va', 'bri_va', 'gopay', 'qris', 'credit_card', 'shopeepay']
    }

    const parameter = {
      transaction_details: {
        order_id: bookingCode,
        gross_amount: total
      },
      customer_details: {
        first_name: user.name,
        email: user.email,
      },
      item_details: [
        {
          id: `TKT-${destinationId}`,
          price: destination.ticketPrice,
          quantity: ticketCount,
          name: `Tiket ${destination.name.substring(0, 40)}`
        },
        ...(serviceFee > 0 ? [{
          id: 'FEE-1',
          price: serviceFee,
          quantity: 1,
          name: 'Biaya Layanan'
        }] : [])
      ],
      enabled_payments: enabledPayments
    }

    const transToken = await snap.createTransaction(parameter)

    await prisma.booking.update({
      where: { id: booking.id },
      data: { paymentToken: transToken.token }
    })

    return NextResponse.json({
      bookingCode,
      token: transToken.token,
      redirectUrl: transToken.redirect_url
    })

  } catch (error: any) {
    console.error('Checkout Error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
