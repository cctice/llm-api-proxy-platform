import { PrismaClient } from '@prisma/client';
import { AppError } from '../middleware/errorHandler';
import { TokenCounter } from '../utils/tokens';

const prisma = new PrismaClient();

export class ApiKeyService {
  static async createApiKey(
    userId: string,
    name: string,
    description?: string,
    maxTokens?: number,
    maxRequests?: number,
    expiresAt?: Date
  ) {
    // Generate API key
    const keyPrefix = `sk-proj_${Math.random().toString(36).substring(2, 15)}`;
    const keySecret = `${keyPrefix}_${this.generateSecret()}`;

    // Create API key in database
    const apiKey = await prisma.apiKey.create({
      data: {
        userId,
        keyPrefix,
        keySecret, // In production, this should be encrypted
        name,
        description,
        maxTokens,
        maxRequests,
        expiresAt,
      },
    });

    return {
      id: apiKey.id,
      keyPrefix,
      keySecret,
      name: apiKey.name,
      createdAt: apiKey.createdAt,
    };
  }

  static async validateApiKey(keySecret: string) {
    const apiKey = await prisma.apiKey.findUnique({
      where: { keySecret },
      include: { user: true },
    });

    if (!apiKey || !apiKey.enabled) {
      return null;
    }

    // Check expiration
    if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
      return null;
    }

    // Check quota limits
    if (apiKey.maxTokens && apiKey.totalTokens >= apiKey.maxTokens) {
      return null;
    }

    if (apiKey.maxRequests && apiKey.totalRequests >= apiKey.maxRequests) {
      return null;
    }

    return apiKey;
  }

  static async listApiKeys(userId: string) {
    const apiKeys = await prisma.apiKey.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        keyPrefix: true,
        name: true,
        description: true,
        maxTokens: true,
        maxRequests: true,
        expiresAt: true,
        totalTokens: true,
        totalRequests: true,
        lastUsedAt: true,
        enabled: true,
        createdAt: true,
      },
    });

    return apiKeys;
  }

  static async deleteApiKey(userId: string, keyId: string) {
    const apiKey = await prisma.apiKey.findFirst({
      where: { id: keyId, userId },
    });

    if (!apiKey) {
      throw new AppError(404, 'API_KEY_NOT_FOUND', 'API key not found');
    }

    await prisma.apiKey.delete({
      where: { id: keyId },
    });

    return { success: true };
  }

  static async updateApiKey(
    userId: string,
    keyId: string,
    updates: Partial<{
      name: string;
      description: string;
      enabled: boolean;
    }>
  ) {
    const apiKey = await prisma.apiKey.findFirst({
      where: { id: keyId, userId },
    });

    if (!apiKey) {
      throw new AppError(404, 'API_KEY_NOT_FOUND', 'API key not found');
    }

    const updated = await prisma.apiKey.update({
      where: { id: keyId },
      data: updates,
    });

    return updated;
  }

  static async recordUsage(keyId: string, tokens: number) {
    await prisma.apiKey.update({
      where: { id: keyId },
      data: {
        totalTokens: { increment: tokens },
        totalRequests: { increment: 1 },
        lastUsedAt: new Date(),
      },
    });
  }

  private static generateSecret(): string {
    return Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }
}
