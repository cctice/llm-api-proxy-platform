import { PrismaClient } from '@prisma/client';
import { hashPassword } from './src/utils/auth';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 开始种子数据初始化...');

  // 创建测试用户
  const hashedPassword = await hashPassword('admin123');
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password: hashedPassword,
      name: 'Admin User',
      role: 'admin',
    },
  });

  console.log('✅ 创建管理员用户:', adminUser.email);

  const testUser = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      password: await hashPassword('test123'),
      name: 'Test User',
      role: 'user',
    },
  });

  console.log('✅ 创建测试用户:', testUser.email);

  // 创建 API 提供商
  const openai = await prisma.apiProvider.upsert({
    where: { name: 'openai' },
    update: {},
    create: {
      name: 'openai',
      displayName: 'OpenAI',
      endpoint: 'https://api.openai.com/v1',
      enabled: true,
    },
  });

  console.log('✅ 创建 OpenAI 提供商');

  const anthropic = await prisma.apiProvider.upsert({
    where: { name: 'anthropic' },
    update: {},
    create: {
      name: 'anthropic',
      displayName: 'Anthropic',
      endpoint: 'https://api.anthropic.com/v1',
      enabled: true,
    },
  });

  console.log('✅ 创建 Anthropic 提供商');

  const zhipu = await prisma.apiProvider.upsert({
    where: { name: 'zhipu' },
    update: {},
    create: {
      name: 'zhipu',
      displayName: '智谱AI',
      endpoint: 'https://open.bigmodel.cn/api/paas/v4',
      enabled: true,
    },
  });

  console.log('✅ 创建智谱AI 提供商');

  const qwen = await prisma.apiProvider.upsert({
    where: { name: 'qwen' },
    update: {},
    create: {
      name: 'qwen',
      displayName: '通义千问',
      endpoint: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
      enabled: true,
    },
  });

  console.log('✅ 创建通义千问提供商');

  // 创建 OpenAI 模型
  await prisma.model.upsert({
    where: {
      providerId_name: {
        providerId: openai.id,
        name: 'gpt-4',
      },
    },
    update: {},
    create: {
      providerId: openai.id,
      name: 'gpt-4',
      displayName: 'GPT-4',
      type: 'chat',
      contextWindow: 8192,
      maxTokens: 4096,
      enabled: true,
    },
  });

  await prisma.model.upsert({
    where: {
      providerId_name: {
        providerId: openai.id,
        name: 'gpt-4-turbo',
      },
    },
    update: {},
    create: {
      providerId: openai.id,
      name: 'gpt-4-turbo',
      displayName: 'GPT-4 Turbo',
      type: 'chat',
      contextWindow: 128000,
      maxTokens: 4096,
      enabled: true,
    },
  });

  await prisma.model.upsert({
    where: {
      providerId_name: {
        providerId: openai.id,
        name: 'gpt-3.5-turbo',
      },
    },
    update: {},
    create: {
      providerId: openai.id,
      name: 'gpt-3.5-turbo',
      displayName: 'GPT-3.5 Turbo',
      type: 'chat',
      contextWindow: 16385,
      maxTokens: 4096,
      enabled: true,
    },
  });

  console.log('✅ 创建 OpenAI 模型');

  // 创建 Anthropic 模型
  await prisma.model.upsert({
    where: {
      providerId_name: {
        providerId: anthropic.id,
        name: 'claude-3-opus-20240229',
      },
    },
    update: {},
    create: {
      providerId: anthropic.id,
      name: 'claude-3-opus-20240229',
      displayName: 'Claude 3 Opus',
      type: 'chat',
      contextWindow: 200000,
      maxTokens: 4096,
      enabled: true,
    },
  });

  await prisma.model.upsert({
    where: {
      providerId_name: {
        providerId: anthropic.id,
        name: 'claude-3-sonnet-20240229',
      },
    },
    update: {},
    create: {
      providerId: anthropic.id,
      name: 'claude-3-sonnet-20240229',
      displayName: 'Claude 3 Sonnet',
      type: 'chat',
      contextWindow: 200000,
      maxTokens: 4096,
      enabled: true,
    },
  });

  console.log('✅ 创建 Anthropic 模型');

  // 创建智谱模型
  await prisma.model.upsert({
    where: {
      providerId_name: {
        providerId: zhipu.id,
        name: 'glm-4',
      },
    },
    update: {},
    create: {
      providerId: zhipu.id,
      name: 'glm-4',
      displayName: 'GLM-4',
      type: 'chat',
      contextWindow: 128000,
      maxTokens: 8192,
      enabled: true,
    },
  });

  console.log('✅ 创建智谱AI 模型');

  // 创建通义千问模型
  await prisma.model.upsert({
    where: {
      providerId_name: {
        providerId: qwen.id,
        name: 'qwen-turbo',
      },
    },
    update: {},
    create: {
      providerId: qwen.id,
      name: 'qwen-turbo',
      displayName: 'Qwen Turbo',
      type: 'chat',
      contextWindow: 8000,
      maxTokens: 2000,
      enabled: true,
    },
  });

  await prisma.model.upsert({
    where: {
      providerId_name: {
        providerId: qwen.id,
        name: 'qwen-plus',
      },
    },
    update: {},
    create: {
      providerId: qwen.id,
      name: 'qwen-plus',
      displayName: 'Qwen Plus',
      type: 'chat',
      contextWindow: 32000,
      maxTokens: 6000,
      enabled: true,
    },
  });

  console.log('✅ 创建通义千问模型');

  // 创建计费规则（示例价格）
  // 获取模型 ID
  const gpt4Model = await prisma.model.findFirst({
    where: { name: 'gpt-4', providerId: openai.id },
  });

  const gpt35Model = await prisma.model.findFirst({
    where: { name: 'gpt-3.5-turbo', providerId: openai.id },
  });

  const claudeOpusModel = await prisma.model.findFirst({
    where: { name: 'claude-3-opus-20240229', providerId: anthropic.id },
  });

  if (gpt4Model) {
    await prisma.billingRule.upsert({
      where: {
        providerId_modelId: {
          providerId: openai.id,
          modelId: gpt4Model.id,
        },
      },
      update: {},
      create: {
        providerId: openai.id,
        modelId: gpt4Model.id,
        inputPrice: 0.03,  // 每1K输入tokens价格
        outputPrice: 0.06, // 每1K输出tokens价格
        currency: 'USD',
      },
    });
  }

  if (gpt35Model) {
    await prisma.billingRule.upsert({
      where: {
        providerId_modelId: {
          providerId: openai.id,
          modelId: gpt35Model.id,
        },
      },
      update: {},
      create: {
        providerId: openai.id,
        modelId: gpt35Model.id,
        inputPrice: 0.0005,
        outputPrice: 0.0015,
        currency: 'USD',
      },
    });
  }

  if (claudeOpusModel) {
    await prisma.billingRule.upsert({
      where: {
        providerId_modelId: {
          providerId: anthropic.id,
          modelId: claudeOpusModel.id,
        },
      },
      update: {},
      create: {
        providerId: anthropic.id,
        modelId: claudeOpusModel.id,
        inputPrice: 0.015,
        outputPrice: 0.075,
        currency: 'USD',
      },
    });
  }

  console.log('✅ 创建计费规则');

  console.log('🎉 种子数据初始化完成！');
  console.log('');
  console.log('测试账户信息:');
  console.log('  管理员: admin@example.com / admin123');
  console.log('  普通用户: test@example.com / test123');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ 种子数据初始化失败:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
