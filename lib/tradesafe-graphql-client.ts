/**
 * TradeSafe GraphQL API Client
 * 
 * This client handles authentication and GraphQL operations for TradeSafe's API.
 * It uses OAuth 2.0 client credentials flow for authentication.
 * 
 * Environment Variables Required:
 * - TRADESAFE_CLIENT_ID: OAuth Client ID from TradeSafe
 * - TRADESAFE_CLIENT_SECRET: OAuth Client Secret from TradeSafe  
 * - TRADESAFE_ENVIRONMENT: "sandbox" or "production"
 * - TRADESAFE_AUTH_URL: TradeSafe OAuth server URL
 * - TRADESAFE_GRAPHQL_URL: TradeSafe GraphQL API URL
 */

// Types for TradeSafe API responses
export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
}

export interface GraphQLResponse<T = any> {
  data?: T;
  errors?: Array<{
    message: string;
    path?: string[];
    extensions?: any;
  }>;
}

export interface UserToken {
  id: string;
  name: string;
  reference: string;
  balance?: number;
  user: {
    givenName: string;
    familyName: string;
    email: string;
    mobile: string;
  };
  organization?: {
    name: string;
    tradeName?: string;
    type: string;
    registration: string;
    taxNumber?: string;
  };
}

export interface Transaction {
  id: string;
  title: string;
  description: string;
  industry: string;
  state: string;
  currency: string;
  feeAllocation: string;
  workflow?: string;
  reference?: string;
  createdAt: string;
  parties: Array<{
    id: string;
    name: string;
    role: string;
    details: {
      user: {
        givenName: string;
        familyName: string;
        email: string;
      };
    };
  }>;
  allocations: Array<{
    id: string;
    title: string;
    description: string;
    value: number;
    state: string;
    daysToDeliver: number;
    daysToInspect: number;
  }>;
}

export interface TradesafeCallback {
  url: string;
  data: {
    id: string;
    reference: string;
    state: string;
    balance: string;
    updated_at: string;
    allocations: Array<{
      id: string;
      state: string;
      updated_at: string;
    }>;
  };
}

/**
 * TradeSafe GraphQL API Client
 */
export class TradesafeGraphQLClient {
  private clientId: string;
  private clientSecret: string;
  private environment: 'sandbox' | 'production';
  private authUrl: string;
  private graphqlUrl: string;
  private accessToken: string | null = null;
  private tokenExpiry: Date | null = null;

  constructor() {
    this.clientId = process.env.TRADESAFE_CLIENT_ID || '';
    this.clientSecret = process.env.TRADESAFE_CLIENT_SECRET || '';
    this.environment = (process.env.TRADESAFE_ENVIRONMENT as 'sandbox' | 'production') || 'sandbox';
    this.authUrl = process.env.TRADESAFE_AUTH_URL || 'https://auth.tradesafe.co.za';
    
    // Use correct GraphQL endpoints based on environment
    this.graphqlUrl = this.environment === 'production' 
      ? 'https://api.tradesafe.co.za/graphql'
      : 'https://api-developer.tradesafe.dev/graphql';

    if (!this.clientId || !this.clientSecret) {
      throw new Error('TradeSafe credentials not configured. Please set TRADESAFE_CLIENT_ID and TRADESAFE_CLIENT_SECRET');
    }
  }

  /**
   * Get OAuth access token using client credentials flow
   */
  private async getAccessToken(): Promise<string> {
    // Return cached token if still valid
    if (this.accessToken && this.tokenExpiry && new Date() < this.tokenExpiry) {
      return this.accessToken;
    }

    try {
      console.log('🔑 Acquiring TradeSafe OAuth access token...');
      
      const response = await fetch(`${this.authUrl}/oauth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
        },
        body: new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: this.clientId,
          client_secret: this.clientSecret,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OAuth token request failed: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const tokenData: TokenResponse = await response.json();
      this.accessToken = tokenData.access_token;
      
      // Set expiry time (subtract 60 seconds for safety)
      const expiresInMs = (tokenData.expires_in || 3600) * 1000;
      this.tokenExpiry = new Date(Date.now() + expiresInMs - 60000);

      console.log('✅ TradeSafe OAuth access token acquired successfully');
      return this.accessToken;
    } catch (error) {
      console.error('❌ Failed to acquire TradeSafe OAuth access token:', error);
      throw error;
    }
  }

  /**
   * Execute a GraphQL query or mutation
   */
  private async executeGraphQL<T = any>(
    query: string,
    variables: Record<string, any> = {}
  ): Promise<GraphQLResponse<T>> {
    const accessToken = await this.getAccessToken();

    try {
      console.log(`🌐 Executing TradeSafe GraphQL operation to: ${this.graphqlUrl}`);
      
      const response = await fetch(this.graphqlUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          query,
          variables,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`GraphQL request failed: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const result: GraphQLResponse<T> = await response.json();
      
      if (result.errors && result.errors.length > 0) {
        console.error('❌ GraphQL errors:', result.errors);
        throw new Error(`GraphQL errors: ${result.errors.map(e => e.message).join(', ')}`);
      }

      console.log('✅ TradeSafe GraphQL operation completed successfully');
      return result;
    } catch (error) {
      console.error('❌ TradeSafe GraphQL operation failed:', error);
      throw error;
    }
  }

  /**
   * Create a new user token for a buyer or seller
   */
  async createUserToken(userData: {
    givenName: string;
    familyName: string;
    email: string;
    mobile: string;
    organizationName?: string;
    tradeName?: string;
    organizationType?: string;
    registrationNumber?: string;
    taxNumber?: string;
  }): Promise<UserToken> {
    const mutation = `
      mutation TokenCreate($input: TokenCreateInput!) {
        tokenCreate(input: $input) {
          id
          name
          reference
          user {
            givenName
            familyName
            email
            mobile
          }
          organization {
            name
            tradeName
            type
            registration
            taxNumber
          }
        }
      }
    `;

    const variables = {
      input: {
        user: {
          givenName: userData.givenName,
          familyName: userData.familyName,
          email: userData.email,
          mobile: userData.mobile,
        },
        ...(userData.organizationName && {
          organization: {
            name: userData.organizationName,
            tradeName: userData.tradeName,
            type: userData.organizationType || 'PRIVATE',
            registrationNumber: userData.registrationNumber || '000000000',
            taxNumber: userData.taxNumber,
          }
        }),
      },
    };

    const result = await this.executeGraphQL<{ tokenCreate: UserToken }>(mutation, variables);
    return result.data!.tokenCreate;
  }

  /**
   * Get an existing user token by ID
   */
  async getUserToken(tokenId: string): Promise<UserToken> {
    const query = `
      query Token($id: ID!) {
        token(id: $id) {
          data {
            id
            name
            reference
            balance
            user {
              givenName
              familyName
              email
              mobile
            }
            organization {
              name
              tradeName
              type
              registration
              taxNumber
            }
          }
        }
      }
    `;

    const result = await this.executeGraphQL<{ token: { data: UserToken } }>(query, { id: tokenId });
    return result.data!.token.data;
  }

  /**
   * Create a new transaction/trade contract
   */
  async createTransaction(transactionData: {
    title: string;
    description: string;
    industry?: string;
    currency?: string;
    feeAllocation?: string;
    workflow?: string;
    reference?: string;
    buyerTokenId: string;
    sellerTokenId: string;
    allocations: Array<{
      title: string;
      description: string;
      value: number;
      daysToDeliver?: number;
      daysToInspect?: number;
    }>;
  }): Promise<Transaction> {
    const mutation = `
      mutation TransactionCreate($input: TransactionCreateInput!) {
        transactionCreate(input: $input) {
          id
          title
          description
          industry
          state
          currency
          feeAllocation
          workflow
          reference
          createdAt
          parties {
            id
            name
            role
            details {
              user {
                givenName
                familyName
                email
              }
            }
          }
          allocations {
            id
            title
            description
            value
            state
            daysToDeliver
            daysToInspect
          }
        }
      }
    `;

    const variables = {
      input: {
        title: transactionData.title,
        description: transactionData.description,
        industry: transactionData.industry || 'GENERAL_GOODS_SERVICES',
        currency: transactionData.currency || 'ZAR',
        feeAllocation: transactionData.feeAllocation || 'SELLER',
        workflow: transactionData.workflow || 'STANDARD',
        reference: transactionData.reference,
        allocations: {
          create: transactionData.allocations.map(allocation => ({
            title: allocation.title,
            description: allocation.description,
            value: allocation.value,
            daysToDeliver: allocation.daysToDeliver || 7,
            daysToInspect: allocation.daysToInspect || 7,
          })),
        },
        parties: {
          create: [
            {
              token: transactionData.buyerTokenId,
              role: 'BUYER',
            },
            {
              token: transactionData.sellerTokenId,
              role: 'SELLER',
            },
          ],
        },
      },
    };

    const result = await this.executeGraphQL<{ transactionCreate: Transaction }>(mutation, variables);
    return result.data!.transactionCreate;
  }

  /**
   * Get a transaction by ID
   */
  async getTransaction(transactionId: string): Promise<Transaction> {
    const query = `
      query Transaction($id: ID!) {
        transaction(id: $id) {
          id
          title
          description
          industry
          state
          currency
          feeAllocation
          workflow
          reference
          createdAt
          parties {
            id
            name
            role
            details {
              user {
                givenName
                familyName
                email
              }
            }
          }
          allocations {
            id
            title
            description
            value
            state
            daysToDeliver
            daysToInspect
          }
        }
      }
    `;

    const result = await this.executeGraphQL<{ transaction: Transaction }>(query, { id: transactionId });
    return result.data!.transaction;
  }

  /**
   * List all transactions
   */
  async listTransactions(): Promise<Transaction[]> {
    const query = `
      query Transactions {
        transactions {
          data {
            id
            title
            description
            industry
            state
            currency
            feeAllocation
            createdAt
          }
        }
      }
    `;

    const result = await this.executeGraphQL<{ transactions: { data: Transaction[] } }>(query);
    return result.data!.transactions.data;
  }

  /**
   * Create a payment link for a transaction
   */
  async createPaymentLink(transactionId: string, embed: boolean = false): Promise<{ id: string; url: string; expiresAt: string }> {
    const mutation = `
      mutation CreatePaymentLink($transactionId: ID!, $embed: Boolean) {
        createPaymentLink(transactionId: $transactionId, embed: $embed) {
          id
          url
          expiresAt
        }
      }
    `;

    const result = await this.executeGraphQL<{ 
      createPaymentLink: { id: string; url: string; expiresAt: string } 
    }>(mutation, { transactionId, embed });
    
    return result.data!.createPaymentLink;
  }
}

// Export a singleton instance
export const tradesafeGraphQL = new TradesafeGraphQLClient();
