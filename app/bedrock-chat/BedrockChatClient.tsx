'use client';

import { useState } from 'react';
import { sendMessage } from '@/app/_actions/bedrock-chat';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export function BedrockChatClient() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    setError(null);
    setIsLoading(true);

    // Add user message to chat
    const userMsgId = `user-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      { id: userMsgId, role: 'user', content: userMessage },
    ]);

    try {
      const result = await sendMessage({ message: userMessage });

      if (result.ok) {
        const assistantMsgId = `assistant-${Date.now()}`;
        setMessages((prev) => [
          ...prev,
          { id: assistantMsgId, role: 'assistant', content: result.data.reply },
        ]);
      } else {
        setError(`${result.error.code}: ${result.error.message}`);
      }
    } catch (err) {
      setError('Failed to send message. Check console for details.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='rounded-lg border border-gray-200 bg-white shadow-sm'>
      {/* Messages area */}
      <div className='h-96 overflow-y-auto p-4'>
        {messages.length === 0 ? (
          <div className='flex h-full items-center justify-center text-gray-400'>
            <p>Send a message to start the conversation</p>
          </div>
        ) : (
          <div className='space-y-4'>
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className='whitespace-pre-wrap wrap-break-word'>
                    {msg.content}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Error display */}
      {error && (
        <div className='border-t border-gray-200 bg-red-50 px-4 py-2'>
          <p className='text-sm text-red-600'>{error}</p>
        </div>
      )}

      {/* Input form */}
      <form
        onSubmit={handleSubmit}
        className='flex gap-2 border-t border-gray-200 p-4'
      >
        <input
          type='text'
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isLoading}
          placeholder='Type a message...'
          className='flex-1 rounded-md border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-400 text-slate-800'
        />
        <button
          type='submit'
          disabled={isLoading || !input.trim()}
          className='rounded-md bg-blue-600 px-6 py-2 font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-300 disabled:text-gray-500'
        >
          {isLoading ? 'Sending...' : 'Send'}
        </button>
      </form>
    </div>
  );
}
