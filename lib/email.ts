import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendWelcomeEmail(email: string, name: string) {
  try {
    await resend.emails.send({
      from: 'KibbleDrop <noreply@kibbledrop.com>',
      to: email,
      subject: 'Welcome to KibbleDrop! 🐾',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #f97316;">Welcome to KibbleDrop!</h1>
          <p>Hi ${name},</p>
          <p>Thank you for joining KibbleDrop! We're excited to help you provide the best nutrition for your furry friends.</p>
          <p>With KibbleDrop, you'll get:</p>
          <ul>
            <li>Fresh, premium pet food delivered to your door</li>
            <li>Flexible subscription options (weekly, bi-weekly, monthly)</li>
            <li>Personalized recommendations based on your pet's needs</li>
            <li>Easy management through your dashboard</li>
          </ul>
          <p>Ready to get started? <a href="${process.env.NEXTAUTH_URL}/dashboard/products" style="color: #f97316;">Browse our products</a></p>
          <p>Best regards,<br>The KibbleDrop Team</p>
        </div>
      `
    })
  } catch (error) {
    console.error('Error sending welcome email:', error)
  }
}

export async function sendSubscriptionConfirmationEmail(
  email: string,
  name: string,
  subscriptionDetails: {
    frequency: string
    items: Array<{ name: string; quantity: number }>
    nextDelivery: Date
  }
) {
  try {
    const itemsList = subscriptionDetails.items
      .map(item => `${item.name} (Qty: ${item.quantity})`)
      .join('<br>')

    await resend.emails.send({
      from: 'KibbleDrop <noreply@kibbledrop.com>',
      to: email,
      subject: 'Your KibbleDrop Subscription is Active! 🎉',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #f97316;">Subscription Confirmed!</h1>
          <p>Hi ${name},</p>
          <p>Great news! Your KibbleDrop subscription is now active.</p>
          
          <h3>Subscription Details:</h3>
          <ul>
            <li><strong>Frequency:</strong> ${subscriptionDetails.frequency}</li>
            <li><strong>Next Delivery:</strong> ${subscriptionDetails.nextDelivery.toLocaleDateString()}</li>
          </ul>
          
          <h3>Your Order:</h3>
          <div>${itemsList}</div>
          
          <p>You can manage your subscription anytime from your <a href="${process.env.NEXTAUTH_URL}/dashboard/subscription" style="color: #f97316;">dashboard</a>.</p>
          
          <p>Thank you for choosing KibbleDrop!</p>
          <p>Best regards,<br>The KibbleDrop Team</p>
        </div>
      `
    })
  } catch (error) {
    console.error('Error sending subscription confirmation email:', error)
  }
}

export async function sendDeliveryReminderEmail(
  email: string,
  name: string,
  deliveryDate: Date,
  items: Array<{ name: string; quantity: number }>
) {
  try {
    const itemsList = items
      .map(item => `${item.name} (Qty: ${item.quantity})`)
      .join('<br>')

    await resend.emails.send({
      from: 'KibbleDrop <noreply@kibbledrop.com>',
      to: email,
      subject: 'Your KibbleDrop Delivery is Coming! 📦',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #f97316;">Delivery Reminder</h1>
          <p>Hi ${name},</p>
          <p>Your KibbleDrop delivery is scheduled for <strong>${deliveryDate.toLocaleDateString()}</strong>.</p>
          
          <h3>What's Coming:</h3>
          <div>${itemsList}</div>
          
          <p>Please ensure someone is available to receive the delivery.</p>
          
          <p>Track your delivery from your <a href="${process.env.NEXTAUTH_URL}/dashboard/delivery" style="color: #f97316;">dashboard</a>.</p>
          
          <p>Best regards,<br>The KibbleDrop Team</p>
        </div>
      `
    })
  } catch (error) {
    console.error('Error sending delivery reminder email:', error)
  }
} 