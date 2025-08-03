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

export async function sendOrderStatusUpdateEmail(
  email: string,
  name: string,
  orderDetails: {
    orderId: string
    status: string
    trackingNumber?: string
    estimatedDelivery?: Date
    items: Array<{ name: string; quantity: number }>
  }
) {
  try {
    const itemsList = orderDetails.items
      .map(item => `${item.name} (Qty: ${item.quantity})`)
      .join('<br>')

    const statusMessages = {
      'processing': 'Your order is now being processed and prepared for shipping.',
      'shipped': 'Your order has been shipped and is on its way to you!',
      'delivered': 'Your order has been delivered successfully.',
      'canceled': 'Your order has been canceled as requested.'
    }

    const statusMessage = statusMessages[orderDetails.status as keyof typeof statusMessages] || 'Your order status has been updated.'

    await resend.emails.send({
      from: 'KibbleDrop <noreply@kibbledrop.com>',
      to: email,
      subject: `Order #${orderDetails.orderId} Status Update - ${orderDetails.status.charAt(0).toUpperCase() + orderDetails.status.slice(1)}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #f97316;">Order Status Update</h1>
          <p>Hi ${name},</p>
          <p>${statusMessage}</p>
          
          <h3>Order Details:</h3>
          <ul>
            <li><strong>Order ID:</strong> #${orderDetails.orderId}</li>
            <li><strong>Status:</strong> ${orderDetails.status.charAt(0).toUpperCase() + orderDetails.status.slice(1)}</li>
            ${orderDetails.trackingNumber ? `<li><strong>Tracking Number:</strong> ${orderDetails.trackingNumber}</li>` : ''}
            ${orderDetails.estimatedDelivery ? `<li><strong>Estimated Delivery:</strong> ${orderDetails.estimatedDelivery.toLocaleDateString()}</li>` : ''}
          </ul>
          
          <h3>Your Order:</h3>
          <div>${itemsList}</div>
          
          <p>Track your order from your <a href="${process.env.NEXTAUTH_URL}/orders/${orderDetails.orderId}" style="color: #f97316;">dashboard</a>.</p>
          
          <p>Thank you for choosing KibbleDrop!</p>
          <p>Best regards,<br>The KibbleDrop Team</p>
        </div>
      `
    })
  } catch (error) {
    console.error('Error sending order status update email:', error)
  }
}

export async function sendOrderConfirmationEmail(
  email: string,
  name: string,
  orderDetails: {
    orderId: string
    total: number
    estimatedDelivery: Date
    items: Array<{ name: string; quantity: number; price: number }>
    deliveryAddress: string
  }
) {
  try {
    const itemsList = orderDetails.items
      .map(item => `${item.name} (Qty: ${item.quantity}) - $${item.price.toFixed(2)}`)
      .join('<br>')

    await resend.emails.send({
      from: 'KibbleDrop <noreply@kibbledrop.com>',
      to: email,
      subject: `Order Confirmation #${orderDetails.orderId} - KibbleDrop`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #f97316;">Order Confirmation</h1>
          <p>Hi ${name},</p>
          <p>Thank you for your order! We've received your order and it's being processed.</p>
          
          <h3>Order Details:</h3>
          <ul>
            <li><strong>Order ID:</strong> #${orderDetails.orderId}</li>
            <li><strong>Total:</strong> $${orderDetails.total.toFixed(2)}</li>
            <li><strong>Estimated Delivery:</strong> ${orderDetails.estimatedDelivery.toLocaleDateString()}</li>
            <li><strong>Delivery Address:</strong> ${orderDetails.deliveryAddress}</li>
          </ul>
          
          <h3>Your Order:</h3>
          <div>${itemsList}</div>
          
          <p>Track your order from your <a href="${process.env.NEXTAUTH_URL}/orders/${orderDetails.orderId}" style="color: #f97316;">dashboard</a>.</p>
          
          <p>Thank you for choosing KibbleDrop!</p>
          <p>Best regards,<br>The KibbleDrop Team</p>
        </div>
      `
    })
  } catch (error) {
    console.error('Error sending order confirmation email:', error)
  }
}

export async function sendRefundNotificationEmail(
  email: string,
  name: string,
  refundDetails: {
    orderId: string
    refundAmount: number
    reason: string
    refundId: string
  }
) {
  try {
    await resend.emails.send({
      from: 'KibbleDrop <noreply@kibbledrop.com>',
      to: email,
      subject: `Refund Processed - Order #${refundDetails.orderId}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #f97316;">Refund Processed</h1>
          <p>Hi ${name},</p>
          <p>Your refund has been processed successfully.</p>
          
          <h3>Refund Details:</h3>
          <ul>
            <li><strong>Order ID:</strong> #${refundDetails.orderId}</li>
            <li><strong>Refund Amount:</strong> $${refundDetails.refundAmount.toFixed(2)}</li>
            <li><strong>Refund ID:</strong> ${refundDetails.refundId}</li>
            <li><strong>Reason:</strong> ${refundDetails.reason}</li>
          </ul>
          
          <p>The refund will appear in your account within 5-10 business days, depending on your bank.</p>
          
          <p>If you have any questions, please contact our support team.</p>
          
          <p>Thank you for choosing KibbleDrop!</p>
          <p>Best regards,<br>The KibbleDrop Team</p>
        </div>
      `
    })
  } catch (error) {
    console.error('Error sending refund notification email:', error)
  }
} 

export async function sendSubscriptionStatusUpdateEmail(
  email: string,
  name: string,
  subscriptionDetails: {
    subscriptionId: string
    status: string
    frequency: string
    nextDelivery?: Date
    items: Array<{ name: string; quantity: number }>
  }
) {
  try {
    const itemsList = subscriptionDetails.items
      .map(item => `${item.name} (Qty: ${item.quantity})`)
      .join('<br>')

    const statusMessages = {
      'paused': 'Your subscription has been paused. You won\'t be charged until you resume it.',
      'active': 'Your subscription has been resumed. Your next delivery is scheduled.',
      'cancelled': 'Your subscription has been cancelled. You won\'t receive any more deliveries.',
      'skipped': 'Your next delivery has been skipped. Your next delivery will be on the following schedule.'
    }

    await resend.emails.send({
      from: 'KibbleDrop <noreply@kibbledrop.com>',
      to: email,
      subject: `Your KibbleDrop Subscription - ${subscriptionDetails.status.charAt(0).toUpperCase() + subscriptionDetails.status.slice(1)}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #f97316;">Subscription Update</h1>
          <p>Hi ${name},</p>
          <p>${statusMessages[subscriptionDetails.status as keyof typeof statusMessages] || 'Your subscription has been updated.'}</p>
          
          <h3>Subscription Details:</h3>
          <ul>
            <li><strong>Subscription ID:</strong> ${subscriptionDetails.subscriptionId}</li>
            <li><strong>Status:</strong> ${subscriptionDetails.status}</li>
            <li><strong>Frequency:</strong> ${subscriptionDetails.frequency}</li>
            ${subscriptionDetails.nextDelivery ? `<li><strong>Next Delivery:</strong> ${subscriptionDetails.nextDelivery.toLocaleDateString()}</li>` : ''}
          </ul>
          
          <h3>Your Items:</h3>
          <div>${itemsList}</div>
          
          <p>You can manage your subscription anytime from your <a href="${process.env.NEXTAUTH_URL}/dashboard/subscription/manage" style="color: #f97316;">dashboard</a>.</p>
          
          <p>Thank you for choosing KibbleDrop!</p>
          <p>Best regards,<br>The KibbleDrop Team</p>
        </div>
      `
    })
  } catch (error) {
    console.error('Error sending subscription status update email:', error)
  }
}

export async function sendSkipDeliveryEmail(
  email: string,
  name: string,
  subscriptionDetails: {
    subscriptionId: string
    skippedDate: Date
    nextDelivery: Date
    items: Array<{ name: string; quantity: number }>
  }
) {
  try {
    const itemsList = subscriptionDetails.items
      .map(item => `${item.name} (Qty: ${item.quantity})`)
      .join('<br>')

    await resend.emails.send({
      from: 'KibbleDrop <noreply@kibbledrop.com>',
      to: email,
      subject: 'Your KibbleDrop Delivery Has Been Skipped 📦',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #f97316;">Delivery Skipped</h1>
          <p>Hi ${name},</p>
          <p>Your delivery scheduled for <strong>${subscriptionDetails.skippedDate.toLocaleDateString()}</strong> has been skipped as requested.</p>
          
          <h3>Your Next Delivery:</h3>
          <p>Your next delivery is scheduled for <strong>${subscriptionDetails.nextDelivery.toLocaleDateString()}</strong>.</p>
          
          <h3>What's Coming Next:</h3>
          <div>${itemsList}</div>
          
          <p>You can manage your subscription anytime from your <a href="${process.env.NEXTAUTH_URL}/dashboard/subscription/manage" style="color: #f97316;">dashboard</a>.</p>
          
          <p>Thank you for choosing KibbleDrop!</p>
          <p>Best regards,<br>The KibbleDrop Team</p>
        </div>
      `
    })
  } catch (error) {
    console.error('Error sending skip delivery email:', error)
  }
} 