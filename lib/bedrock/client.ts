import 'server-only';

import { BedrockRuntimeClient } from '@aws-sdk/client-bedrock-runtime';

import { getBedrockEnv } from '@/lib/env';

let cachedClient: BedrockRuntimeClient | undefined;

export function getBedrockClient(): BedrockRuntimeClient {
  if (cachedClient) return cachedClient;

  const env = getBedrockEnv();

  cachedClient = new BedrockRuntimeClient({
    region: env.AWS_REGION,
    credentials: {
      accessKeyId: env.AWS_ACCESS_KEY_ID,
      secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
    },
  });

  return cachedClient;
}
