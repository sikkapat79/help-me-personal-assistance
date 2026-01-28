'use server';

import { invokeBedrock } from '@/lib/bedrock/invoke';
import { AppError } from '@/lib/errors';
import { Result } from '@/lib/result';

export interface SendMessageInput {
  message: string;
}

export interface SendMessageOutput {
  reply: string;
}

export interface SendMessageError {
  code: string;
  message: string;
}

export async function sendMessage(
  input: SendMessageInput,
): Promise<Result<SendMessageOutput, SendMessageError>> {
  try {
    // Basic validation
    if (!input.message || input.message.trim().length === 0) {
      return {
        ok: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'Message cannot be empty',
        },
      };
    }

    // Call Bedrock
    const response = await invokeBedrock({
      messages: [
        {
          role: 'user',
          content: input.message,
        },
      ],
      systemPrompt: 'You are a helpful assistant. Reply concisely.',
      maxTokens: 500,
    });

    return {
      ok: true,
      data: {
        reply: response.text,
      },
    };
  } catch (error) {
    if (error instanceof AppError) {
      return {
        ok: false,
        error: {
          code: error.code,
          message: error.message,
        },
      };
    }

    return {
      ok: false,
      error: {
        code: 'UNKNOWN_ERROR',
        message: 'An unexpected error occurred',
      },
    };
  }
}
