import { BedrockChatClient } from './BedrockChatClient';

export default function BedrockChatPage() {
  return (
    <div className='min-h-screen bg-gray-50 p-8'>
      <div className='mx-auto max-w-3xl'>
        <div className='mb-8 text-center'>
          <h1 className='text-3xl font-bold text-gray-900'>
            Bedrock Connection Test
          </h1>
          <p className='mt-2 text-gray-600'>
            Send a message to verify AWS Bedrock connectivity
          </p>
        </div>
        <BedrockChatClient />
      </div>
    </div>
  );
}
