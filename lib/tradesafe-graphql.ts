export interface TradesafeGraphQLConfig {
  apiKey: string;
  environment: 'sandbox' | 'production';
}

export interface CreateUserTokenInput {
  email: string;
  mobile?: string;
  givenName?: string;
  familyName?: string;
}

export interface CreateTransactionInput {
  title: string;
  description: string;
  currency: 'ZAR';
  value: number;
  feeAllocation: 'BUYER' | 'SELLER' | 'SPLIT';
  parties: {
    buyer: string; // user token
    seller: string; // user token
  };
  allocations?: Array<{
    title: string;
    description: string;
    value: number;
    daysToDeliver?: number;
    daysToInspect?: number;
  }>;
}

export interface TradesafeUser {
  id: string;
  token: string;
  email: string;
  mobile?: string;
  givenName?: string;
  familyName?: string;
}

export interface TradesafeTransaction {
  id: string;
  reference: string;
  title: string;
  description: string;
  state: string;
  currency: string;
  value: number;
  feeAllocation: string;
  createdAt: string;
  updatedAt: string;
}

export interface TradesafePaymentLink {
  id: string;
  url: string;
  reference: string;
  expiresAt: string;
}

export class TradesafeGraphQLAPI {
  private config: TradesafeGraphQLConfig;
  private endpoint: string;

  constructor(config: TradesafeGraphQLConfig) {
    this.config = config;
    this.endpoint = config.environment === 'production' 
      ? 'https://api.tradesafe.com/graphql' 
      : 'https://api-sandbox.tradesafe.com/graphql';
  }

  private async makeRequest(query: string, variables?: Record<string, any>) {
    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({
          query,
          variables,
        }),
      });

      const result = await response.json();

      if (result.errors) {
        throw new Error(result.errors[0]?.message || 'GraphQL error occurred');
      }

      return result.data;
    } catch (error) {
      console.error('TradeSafe GraphQL API error:', error);
      throw error;
    }
  }

  async createUserToken(input: CreateUserTokenInput): Promise<TradesafeUser> {
    const query = `
      mutation CreateUserToken($input: CreateUserTokenInput!) {
        createUserToken(input: $input) {
          id
          token
          email
          mobile
          givenName
          familyName
        }
      }
    `;

    const data = await this.makeRequest(query, { input });
    return data.createUserToken;
  }

  async createTransaction(input: CreateTransactionInput): Promise<TradesafeTransaction> {
    const query = `
      mutation CreateTransaction($input: CreateTransactionInput!) {
        createTransaction(input: $input) {
          id
          reference
          title
          description
          state
          currency
          value
          feeAllocation
          createdAt
          updatedAt
        }
      }
    `;

    const data = await this.makeRequest(query, { input });
    return data.createTransaction;
  }

  async createPaymentLink(transactionId: string): Promise<TradesafePaymentLink> {
    const query = `
      mutation CreatePaymentLink($transactionId: ID!) {
        createPaymentLink(transactionId: $transactionId) {
          id
          url
          reference
          expiresAt
        }
      }
    `;

    const data = await this.makeRequest(query, { transactionId });
    return data.createPaymentLink;
  }

  async getTransaction(id: string): Promise<TradesafeTransaction> {
    const query = `
      query GetTransaction($id: ID!) {
        transaction(id: $id) {
          id
          reference
          title
          description
          state
          currency
          value
          feeAllocation
          createdAt
          updatedAt
        }
      }
    `;

    const data = await this.makeRequest(query, { id });
    return data.transaction;
  }

  async amendAllocation(transactionId: string, allocations: any[]) {
    const query = `
      mutation AmendAllocations($transactionId: ID!, $allocations: [AllocationInput!]!) {
        amendAllocations(transactionId: $transactionId, allocations: $allocations) {
          id
          state
        }
      }
    `;

    const data = await this.makeRequest(query, { 
      transactionId, 
      allocations 
    });
    return data.amendAllocations;
  }

  async acceptAllocation(allocationId: string) {
    const query = `
      mutation AcceptAllocation($allocationId: ID!) {
        acceptAllocation(allocationId: $allocationId) {
          id
          state
        }
      }
    `;

    const data = await this.makeRequest(query, { allocationId });
    return data.acceptAllocation;
  }
}

// Initialize TradeSafe GraphQL client
export const tradesafeGraphQL = new TradesafeGraphQLAPI({
  apiKey: process.env.TRADESAFE_API_KEY || '',
  environment: (process.env.TRADESAFE_ENVIRONMENT as 'sandbox' | 'production') || 'sandbox',
});
