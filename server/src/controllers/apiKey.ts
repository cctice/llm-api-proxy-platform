import { Response } from 'express';
import { ApiKeyService } from '../services/apiKey';
import { successResponse, paginatedResponse } from '../utils/response';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

export class ApiKeyController {
  static async createApiKey(req: AuthRequest, res: Response) {
    const userId = req.user!.id;
    const { name, description, maxTokens, maxRequests, expiresAt } = req.body;

    const apiKey = await ApiKeyService.createApiKey(
      userId,
      name,
      description,
      maxTokens,
      maxRequests,
      expiresAt ? new Date(expiresAt) : undefined
    );

    res.json(successResponse(apiKey, 'API key created successfully'));
  }

  static async listApiKeys(req: AuthRequest, res: Response) {
    const userId = req.user!.id;

    const apiKeys = await ApiKeyService.listApiKeys(userId);

    res.json(successResponse(apiKeys));
  }

  static async deleteApiKey(req: AuthRequest, res: Response) {
    const userId = req.user!.id;
    const { keyId } = req.params;

    const result = await ApiKeyService.deleteApiKey(userId, keyId);

    res.json(successResponse(result, 'API key deleted successfully'));
  }

  static async updateApiKey(req: AuthRequest, res: Response) {
    const userId = req.user!.id;
    const { keyId } = req.params;
    const { name, description, enabled } = req.body;

    const apiKey = await ApiKeyService.updateApiKey(userId, keyId, {
      name,
      description,
      enabled,
    });

    res.json(successResponse(apiKey, 'API key updated successfully'));
  }
}
