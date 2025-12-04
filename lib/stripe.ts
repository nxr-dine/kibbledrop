import Stripe from "stripe";

// Initialize Stripe with error handling for missing keys
export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-07-30.basil",
    })
  : null;

export async function createSubscriptionSession(
  subscriptionId: string,
  customerEmail: string,
  items: Array<{
    productId: string;
    quantity: number;
    price: number;
    name: string;
  }>,
  frequency: string
) {
  if (!stripe) {
    throw new Error(
      "Stripe is not configured. Please set STRIPE_SECRET_KEY in your environment variables."
    );
  }

  try {
    // Create or retrieve customer
    const customers = await stripe.customers.list({
      email: customerEmail,
      limit: 1,
    });

    let customer;
    if (customers.data.length > 0) {
      customer = customers.data[0];
    } else {
      customer = await stripe.customers.create({
        email: customerEmail,
      });
    }

    // Create subscription session
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ["card"],
      line_items: items.map((item) => ({
        price_data: {
          currency: "usd",
          product_data: {
            name: item.name,
          },
          unit_amount: Math.round(item.price * 100), // Convert to cents
          recurring: {
            interval:
              frequency === "weekly"
                ? "week"
                : frequency === "bi-weekly"
                ? "week"
                : "month",
            interval_count: frequency === "bi-weekly" ? 2 : 1,
          },
        },
        quantity: item.quantity,
      })),
      mode: "subscription",
      success_url: `${process.env.NEXTAUTH_URL}/payment/subscription-success?orderId={CHECKOUT_SESSION_ID}&subscription_id=${subscriptionId}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/checkout?canceled=true`,
      metadata: {
        subscriptionId,
      },
    });

    return session;
  } catch (error) {
    console.error("Error creating subscription session:", error);
    throw error;
  }
}

export async function createOneTimePaymentSession(
  items: Array<{
    productId: string;
    quantity: number;
    price: number;
    name: string;
  }>,
  orderId?: string,
  customerEmail?: string
) {
  if (!stripe) {
    throw new Error(
      "Stripe is not configured. Please set STRIPE_SECRET_KEY in your environment variables."
    );
  }

  try {
    // Create or retrieve customer if email provided
    let customerId: string | undefined;
    if (customerEmail) {
      const customers = await stripe.customers.list({
        email: customerEmail,
        limit: 1,
      });

      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
      } else {
        const customer = await stripe.customers.create({
          email: customerEmail,
        });
        customerId = customer.id;
      }
    }

    const session = await stripe.checkout.sessions.create({
      ...(customerId && { customer: customerId }),
      payment_method_types: ["card"],
      line_items: items.map((item) => ({
        price_data: {
          currency: "usd",
          product_data: {
            name: item.name,
          },
          unit_amount: Math.round(item.price * 100), // Convert to cents
        },
        quantity: item.quantity,
      })),
      mode: "payment",
      success_url: `${
        process.env.NEXTAUTH_URL
      }/payment/success?session_id={CHECKOUT_SESSION_ID}${
        orderId ? `&order_id=${orderId}` : ""
      }`,
      cancel_url: `${process.env.NEXTAUTH_URL}/payment/cancelled`,
      metadata: {
        ...(orderId && { orderId }),
      },
    });

    return session;
  } catch (error) {
    console.error("Error creating payment session:", error);
    throw error;
  }
}
