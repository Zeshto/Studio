'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Post } from '@/lib/types';

const EMOTION_COLORS: Record<string, string> = {
  fear: 'bg-red-100 text-red-700',
  frustration: 'bg-orange-100 text-orange-700',
  hope: 'bg-green-100 text-green-700',
  desire: 'bg-purple-100 text-purple-700',
  educational: 'bg-blue-100 text-blue-700',
};

const EMOTION_ICONS: Record<string, string> = {
  fear: '⚠️', frustration: '😤', hope: '✨', desire: '💫', educational: '📚',
};

interface CalendarViewProps {
  posts: Post[];
}

export default function CalendarView({ posts }: CalendarViewProps) {
  const [search, setSearch] = useState('');
  const [filterEmotion, setFilterEmotion] = useState('all');

  const filtered = posts.filter(p => {
    const matchSearch =
      search === '' ||
      p.productName.toLowerCase().includes(search.toLowerCase()) ||
      p.title.toLowerCase().includes(search.toLowerCase());
    const matchEmotion = filterEmotion === 'all' || p.emotionType === filterEmotion;
    return matchSearch && matchEmotion;
  });

  return (
    <div>
      {/* Search + filter */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <input
          type="text"
          placeholder="Search product or day…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 min-w-[200px] px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-teal-500 focus:outline-none text-sm bg-white"
        />
        <select
          value={filterEmotion}
          onChange={e => setFilterEmotion(e.target.value)}
          className="px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-teal-500 focus:outline-none text-sm bg-white"
        >
          <option value="all">All moods</option>
          <option value="fear">⚠️ Fear</option>
          <option value="frustration">😤 Frustration</option>
          <option value="hope">✨ Hope</option>
          <option value="desire">💫 Desire</option>
          <option value="educational">📚 Educational</option>
        </select>
      </div>

      <p className="text-sm text-gray-500 mb-4">{filtered.length} posts</p>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(post => (
          <Link key={post.dayNumber} href={`/post/${post.dayNumber}`}>
            <div className="bg-white rounded-2xl border-2 border-gray-100 hover:border-teal-400 hover:shadow-md transition-all p-4 cursor-pointer group">
              {/* Day badge */}
              <div className="flex items-start justify-between mb-3">
                <span className="bg-teal-100 text-teal-700 font-bold text-xs px-3 py-1 rounded-full">
                  Day {post.dayNumber}
                </span>
                {post.isEdited && (
                  <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">edited</span>
                )}
              </div>

              {/* Product name */}
              <h3 className="font-bold text-gray-900 mb-1 group-hover:text-teal-700 transition-colors">
                {post.productName}
              </h3>

              {/* Hook preview */}
              <p className="text-xs text-gray-500 line-clamp-2 mb-3">
                {post.content.hookText}
              </p>

              {/* Emotion badge */}
              <span className={`text-xs font-semibold px-2 py-1 rounded-full ${EMOTION_COLORS[post.emotionType] || 'bg-gray-100 text-gray-600'}`}>
                {EMOTION_ICONS[post.emotionType]} {post.emotionType}
              </span>
            </div>
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20 text-gray-400">
          <p className="text-4xl mb-3">🔍</p>
          <p>No posts match your search.</p>
        </div>
      )}
    </div>
  );
}
