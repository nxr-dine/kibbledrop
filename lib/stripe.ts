import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
})

export async function createSubscriptionSession(
  subscriptionId: string,
  customerEmail: string,
  items: Array<{ productId: string; quantity: number; price: number; name: string }>,
  frequency: string
) {
  try {
    // Create or retrieve customer
    const customers = await stripe.customers.list({
      email: customerEmail,
      limit: 1,
    })

    let customer
    if (customers.data.length > 0) {
      customer = customers.data[0]
    } else {
      customer = await stripe.customers.create({
        email: customerEmail,
      })
    }

    // Create subscription session
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ['card'],
      line_items: items.map(item => ({
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.name,
          },
          unit_amount: Math.round(item.price * 100), // Convert to cents
          recurring: {
            interval: frequency === 'weekly' ? 'week' : frequency === 'bi-weekly' ? 'week' : 'month',
            interval_count: frequency === 'bi-weekly' ? 2 : 1,
          },
        },
        quantity: item.quantity,
      })),
      mode: 'subscription',
      success_url: `${process.env.NEXTAUTH_URL}/dashboard/subscription?success=true&subscription_id=${subscriptionId}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/checkout?canceled=true`,
      metadata: {
        subscriptionId,
      },
    })

    return session
  } catch (error) {
    console.error('Error creating subscription session:', error)
    throw error
  }
}

export async function createOneTimePaymentSession(
  items: Array<{ productId: string; quantity: number; price: number; name: string }>
) {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: items.map(item => ({
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.name,
          },
          unit_amount: Math.round(item.price * 100), // Convert to cents
        },
        quantity: item.quantity,
      })),
      mode: 'payment',
      success_url: `${process.env.NEXTAUTH_URL}/dashboard?success=true`,
      cancel_url: `${process.env.NEXTAUTH_URL}/cart?canceled=true`,
    })

    return session
  } catch (error) {
    console.error('Error creating payment session:', error)
    throw error
  }
} 