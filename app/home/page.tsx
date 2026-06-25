import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getSession } from '@/lib/auth';
import { dbQuery } from '@/lib/db';
import CalendarView from '@/components/CalendarView';
import type { Post } from '@/lib/types';
import LogoutButton from './LogoutButton';

export default async function HomePage() {
  const session = await getSession();
  if (!session) redirect('/login');

  let posts: Post[] = [];
  try {
    const rows = await dbQuery<{ day_number: number; data: unknown }>(
      'SELECT day_number, data FROM posts ORDER BY day_number ASC'
    );
    posts = rows.map(r => {
      const data = typeof r.data === 'string' ? JSON.parse(r.data) : r.data;
      return { ...data, dayNumber: r.day_number } as Post;
    });
  } catch {
    // DB not yet seeded — show helpful message
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top nav */}
      <nav className="bg-white border-b border-gray-200 px-4 py-4 sticky top-0 z-40 shadow-sm">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-teal-500 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow">
              Z
            </div>
            <div>
              <h1 className="font-bold text-gray-900 leading-none">Zeshto Studio</h1>
              <p className="text-xs text-gray-400">Content creator</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/settings"
              className="text-sm text-gray-500 hover:text-teal-600 font-medium px-3 py-2 rounded-xl hover:bg-gray-100"
            >
              ⚙️ Settings
            </Link>
            <LogoutButton />
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="max-w-5xl mx-auto px-4 py-8">
        {posts.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-5xl mb-4">🌱</p>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Welcome to Zeshto Studio!</h2>
            <p className="text-gray-500 mb-6">
              You need to set up the app first. It only takes 10 seconds.
            </p>
            <div className="bg-white rounded-2xl border-2 border-teal-100 p-6 max-w-md mx-auto text-left">
              <p className="font-semibold text-gray-800 mb-3">One-time setup:</p>
              <ol className="space-y-2 text-sm text-gray-600">
                <li>1. Copy your app URL (the address in your browser)</li>
                <li>2. Add <code className="bg-gray-100 px-1 rounded">/api/seed?secret=YOUR_SEED_SECRET</code> to the end</li>
                <li>3. Open that URL — it will load your 150 posts automatically</li>
                <li>4. Come back here and refresh the page</li>
              </ol>
              <p className="text-xs text-gray-400 mt-4">
                Your SEED_SECRET is set in your .env file (default: <code>zeshto-seed-2024</code>)
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Your 150-day plan</h2>
                <p className="text-gray-500 text-sm mt-1">Tap any day to open the studio</p>
              </div>
              <span className="bg-teal-100 text-teal-700 text-sm font-bold px-3 py-1.5 rounded-full">
                {posts.length} posts ready
              </span>
            </div>
            <CalendarView posts={posts} />
          </>
        )}
      </main>
    </div>
  );
}
