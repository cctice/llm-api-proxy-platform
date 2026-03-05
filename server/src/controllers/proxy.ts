import { Response } from 'express';
import { LLMProviderService, LLMRequest } from '../services/llmProvider';
import { ApiKeyService } from '../services/apiKey';
import { calculateCost } from '../utils/tokens';
import { PrismaClient } from '@prisma/client';
import { successResponse } from '../utils/response';
import { AppError } from '../middleware/errorHandler';

const prisma = new PrismaClient();

export class ProxyController {
  static async chatCompletion(req: any, res: Response) {
    // Get API key from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError(401, 'UNAUTHORIZED', 'Missing API key');
    }

    const apiKeySecret = authHeader.substring(7);
    const apiKey = await ApiKeyService.validateApiKey(apiKeySecret);

    if (!apiKey) {
      throw new AppError(401, 'INVALID_API_KEY', 'Invalid or expired API key');
    }

    // Get request data
    const { model, messages, temperature, maxTokens, stream } = req.body;

    // Determine provider from model
    const providerName = this.getProviderFromModel(model);

    // Forward to LLM provider
    const startTime = Date.now();
    const response = await LLMProviderService.chatCompletion(
      providerName,
      { messages, model, temperature, maxTokens, stream }
    );
    const latency = Date.now() - startTime;

    // Get billing rule
    const billingRule = await prisma.billingRule.findFirst({
      where: {
        providerId: providerName,
        modelId: model,
      },
    });

    const inputCost = billingRule
      ? calculateCost(
          response.usage.promptTokens,
          0,
          billingRule.inputPrice,
          0
        )
      : 0;
    const outputCost = billingRule
      ? calculateCost(
          0,
          response.usage.completionTokens,
          0,
          billingRule.outputPrice
        )
      : 0;
    const totalCost = inputCost + outputCost;

    // Record request
    await prisma.request.create({
      data: {
        userId: apiKey.userId,
        apiKeyId: apiKey.id,
        modelId: model,
        providerId: providerName,
        promptTokens: response.usage.promptTokens,
        completionTokens: response.usage.completionTokens,
        totalTokens: response.usage.totalTokens,
        inputCost,
        outputCost,
        totalCost,
        latency,
        statusCode: 200,
      },
    });

    // Update API key usage
    await ApiKeyService.recordUsage(apiKey.id, response.usage.totalTokens);

    // Return response
    res.json({
      success: true,
      data: {
        content: response.content,
        usage: response.usage,
        model: response.model,
        cost: totalCost,
      },
    });
  }

  static async models(req: any, res: Response) {
    // Get API key from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError(401, 'UNAUTHORIZED', 'Missing API key');
    }

    const apiKeySecret = authHeader.substring(7);
    const apiKey = await ApiKeyService.validateApiKey(apiKeySecret);

    if (!apiKey) {
      throw new AppError(401, 'INVALID_API_KEY', 'Invalid or expired API key');
    }

    // Get all enabled models
    const models = await prisma.model.findMany({
      where: { enabled: true },
      include: { provider: true },
      orderBy: { provider: { name: 'asc' } },
    });

    const formattedModels = models.map((m) => ({
      id: m.name,
      name: m.displayName,
      provider: m.provider.name,
      type: m.type,
      contextWindow: m.contextWindow,
      maxTokens: m.maxTokens,
    }));

    res.json(successResponse(formattedModels));
  }

  private static getProviderFromModel(model: string): string {
    if (model.startsWith('gpt-')) return 'openai';
    if (model.startsWith('claude-')) return 'anthropic';
    if (model.startsWith('glm-')) return 'zhipu';
    if (model.startsWith('qwen-')) return 'qwen';
    throw new AppError(400, 'INVALID_MODEL', 'Invalid model');
  }
}
