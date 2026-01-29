import 'server-only';

import { InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';

import { AppError } from '@/lib/errors';
import { getBedrockEnv } from '@/lib/env';
import { getBedrockClient } from '@/lib/bedrock/client';

export interface BedrockMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface InvokeBedrockOptions {
  messages: BedrockMessage[];
  systemPrompt?: string;
  maxTokens?: number;
  /** 0–1. Lower = more deterministic (good for planning/reasoning). Default 0.3. */
  temperature?: number;
}

export interface BedrockResponse {
  text: string;
  stopReason: string;
}

export async function invokeBedrock(
  options: InvokeBedrockOptions,
): Promise<BedrockResponse> {
  const client = getBedrockClient();
  const env = getBedrockEnv();

  const payload = {
    anthropic_version: 'bedrock-2023-05-31',
    max_tokens: options.maxTokens ?? 1000,
    temperature: options.temperature ?? 0.3,
    messages: options.messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    })),
    ...(options.systemPrompt ? { system: options.systemPrompt } : {}),
  };

  const command = new InvokeModelCommand({
    modelId: env.BEDROCK_MODEL_ID,
    contentType: 'application/json',
    accept: 'application/json',
    body: JSON.stringify(payload),
  });

  try {
    const response = await client.send(command);

    if (!response.body) {
      throw new AppError(
        'BEDROCK_RESPONSE_EMPTY',
        'Bedrock returned empty response body',
      );
    }

    const responseBody = JSON.parse(new TextDecoder().decode(response.body));

    if (!responseBody.content || !Array.isArray(responseBody.content)) {
      throw new AppError(
        'BEDROCK_RESPONSE_INVALID',
        'Bedrock response format invalid',
        { cause: responseBody },
      );
    }

    const textContent = responseBody.content.find(
      (c: { type: string }) => c.type === 'text',
    );

    if (!textContent || typeof textContent.text !== 'string') {
      throw new AppError(
        'BEDROCK_RESPONSE_NO_TEXT',
        'No text content in Bedrock response',
        { cause: responseBody },
      );
    }

    return {
      text: textContent.text,
      stopReason: responseBody.stop_reason ?? 'unknown',
    };
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    // Extract AWS SDK error details
    const awsError = error as {
      name?: string;
      message?: string;
      $metadata?: { httpStatusCode?: number };
    };

    const errorMessage = awsError.message || 'Failed to invoke Bedrock';
    const errorName = awsError.name || 'BEDROCK_INVOKE_FAILED';
    const statusCode = awsError.$metadata?.httpStatusCode;

    console.error('Bedrock invoke error:', {
      name: errorName,
      message: errorMessage,
      statusCode,
      modelId: env.BEDROCK_MODEL_ID,
      region: env.AWS_REGION,
    });

    throw new AppError(
      errorName,
      `${errorMessage}${statusCode ? ` (HTTP ${statusCode})` : ''}`,
      { cause: error },
    );
  }
}
