import { TaskCreateModal } from '@/components/TaskCreateModal';
import { TaskList } from '@/components/TaskList';

export default function HomePage() {
  return (
    <main className='min-h-screen p-8' id='home-page'>
      <div className='max-w-4xl mx-auto'>
        <header
          className='flex justify-between items-center mb-8'
          id='page-header'
        >
          <div>
            <h1 className='text-3xl font-bold'>Today</h1>
            <p className='text-zinc-600 dark:text-zinc-400 mt-1'>
              Your tasks for today
            </p>
          </div>
          <TaskCreateModal />
        </header>

        <TaskList />
      </div>
    </main>
  );
}
