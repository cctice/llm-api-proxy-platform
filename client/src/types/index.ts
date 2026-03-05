export interface User {
  id: string;
  email: string;
  name?: string;
  role: string;
  createdAt: string;
}

export interface ApiKey {
  id: string;
  keyPrefix: string;
  name: string;
  description?: string;
  maxTokens?: number;
  maxRequests?: number;
  expiresAt?: string;
  totalTokens: number;
  totalRequests: number;
  lastUsedAt?: string;
  enabled: boolean;
  createdAt: string;
}

export interface Model {
  id: string;
  name: string;
  provider: string;
  type: string;
  contextWindow: number;
  maxTokens: number;
}

export interface UsageStats {
  totalTokens: number;
  totalRequests: number;
  totalCost: number;
}
