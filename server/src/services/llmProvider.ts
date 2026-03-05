import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export type LLMProvider = 'openai' | 'anthropic' | 'zhipu' | 'qwen';

export interface LLMRequest {
  messages: Array<{ role: string; content: string }>;
  model: string;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}

export interface LLMResponse {
  content: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model: string;
}

// LLM 提供商服务
export class LLMProviderService {
  private static clients: Map<string, any> = new Map();

  static async getProviderClient(providerName: string) {
    if (this.clients.has(providerName)) {
      return this.clients.get(providerName);
    }

    // 从数据库获取提供商配置
    const provider = await prisma.apiProvider.findUnique({
      where: { name: providerName },
      include: { providerKeys: true },
    });

    if (!provider || !provider.enabled) {
      throw new Error(`Provider ${providerName} not found or disabled`);
    }

    // 选择一个可用的 API Key
    const key = provider.providerKeys.find((k) => k.enabled);
    if (!key) {
      throw new Error(`No available API key for provider ${providerName}`);
    }

    let client: any;
    switch (providerName) {
      case 'openai':
        client = new OpenAI({
          apiKey: key.apiKey,
          baseURL: provider.endpoint,
        });
        break;
      case 'anthropic':
        client = new Anthropic({
          apiKey: key.apiKey,
          baseURL: provider.endpoint,
        });
        break;
      case 'zhipu':
        client = new OpenAI({
          apiKey: key.apiKey,
          baseURL: provider.endpoint,
        });
        break;
      case 'qwen':
        client = new OpenAI({
          apiKey: key.apiKey,
          baseURL: provider.endpoint,
        });
        break;
      default:
        throw new Error(`Unsupported provider: ${providerName}`);
    }

    this.clients.set(providerName, client);
    return client;
  }

  static async chatCompletion(
    providerName: LLMProvider,
    request: LLMRequest
  ): Promise<LLMResponse> {
    const client = await this.getProviderClient(providerName);

    switch (providerName) {
      case 'openai':
      case 'zhipu':
      case 'qwen':
        return this.openAIChatCompletion(client, request);
      case 'anthropic':
        return this.anthropicChatCompletion(client, request);
      default:
        throw new Error(`Unsupported provider: ${providerName}`);
    }
  }

  private static async openAIChatCompletion(
    client: OpenAI,
    request: LLMRequest
  ): Promise<LLMResponse> {
    const response = await client.chat.completions.create({
      model: request.model,
      messages: request.messages,
      temperature: request.temperature ?? 0.7,
      max_tokens: request.maxTokens ?? 2048,
    });

    return {
      content: response.choices[0].message.content || '',
      usage: {
        promptTokens: response.usage?.prompt_tokens || 0,
        completionTokens: response.usage?.completion_tokens || 0,
        totalTokens: response.usage?.total_tokens || 0,
      },
      model: response.model,
    };
  }

  private static async anthropicChatCompletion(
    client: Anthropic,
    request: LLMRequest
  ): Promise<LLMResponse> {
    const response = await client.messages.create({
      model: request.model,
      messages: request.messages,
      max_tokens: request.maxTokens ?? 2048,
    });

    return {
      content: (response.content[0] as any).text,
      usage: {
        promptTokens: response.usage.input_tokens,
        completionTokens: response.usage.output_tokens,
        totalTokens: response.usage.input_tokens + response.usage.output_tokens,
      },
      model: response.model,
    };
  }
}
