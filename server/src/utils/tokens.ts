import { encoding_for_model, Tiktoken } from 'tiktoken';

// Token 计算器
export class TokenCounter {
  private static encoders: Map<string, Tiktoken> = new Map();

  static getEncoder(model: string): Tiktoken {
    if (this.encoders.has(model)) {
      return this.encoders.get(model)!;
    }

    let encoding: string;
    // 根据模型名称确定编码方式
    if (model.includes('gpt-4') || model.includes('gpt-3.5')) {
      encoding = 'cl100k_base';
    } else if (model.includes('claude')) {
      encoding = 'cl100k_base';
    } else {
      encoding = 'cl100k_base'; // 默认使用 cl100k_base
    }

    const encoder = encoding_for_model(model as any);
    this.encoders.set(model, encoder);
    return encoder;
  }

  static countTokens(text: string, model: string = 'gpt-4'): number {
    try {
      const encoder = this.getEncoder(model);
      const tokens = encoder.encode(text);
      return tokens.length;
    } catch (error) {
      // 估算：英文字符约 0.25 tokens，中文字符约 0.5 tokens
      let count = 0;
      for (let i = 0; i < text.length; i++) {
        const charCode = text.charCodeAt(i);
        if (charCode >= 0x4e00 && charCode <= 0x9fff) {
          count += 1; // 中文字符
        } else {
          count += 0.25; // 英文字符
        }
      }
      return Math.ceil(count);
    }
  }

  static countChatTokens(
    messages: Array<{ role: string; content: string }>,
    model: string = 'gpt-4'
  ): number {
    let total = 0;
    for (const message of messages) {
      // 角色和分隔符大约 3-4 tokens
      total += 4;
      total += this.countTokens(message.content, model);
    }
    // 每个消息后的回复前缀大约 3 tokens
    total += 3;
    return total;
  }
}

// 计算费用
export const calculateCost = (
  inputTokens: number,
  outputTokens: number,
  inputPrice: number, // 每1K tokens价格（美元）
  outputPrice: number // 每1K tokens价格（美元）
): number => {
  const inputCost = (inputTokens / 1000) * inputPrice;
  const outputCost = (outputTokens / 1000) * outputPrice;
  return parseFloat((inputCost + outputCost).toFixed(6));
};
