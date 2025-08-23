import { TradesafeGraphQLCheckout } from '@/components/tradesafe-graphql-checkout';

export default function CheckoutGraphQLPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Checkout with TradeSafe GraphQL</h1>
      <TradesafeGraphQLCheckout />
    </div>
  );
}
