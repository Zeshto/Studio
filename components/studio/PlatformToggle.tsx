'use client';

import type { Platform } from '@/lib/types';

interface PlatformToggleProps {
  selected: Platform;
  onSelect: (platform: Platform) => void;
}

const PLATFORMS: { id: Platform; label: string; icon: string; size: string }[] = [
  { id: 'instagram', label: 'Instagram Reel', icon: '📱', size: '1080×1920' },
  { id: 'youtube', label: 'YouTube Short', icon: '▶️', size: '1080×1920' },
  { id: 'linkedin', label: 'LinkedIn Post', icon: '💼', size: '1080×1350' },
];

export default function PlatformToggle({ selected, onSelect }: PlatformToggleProps) {
  return (
    <div>
      <p className="text-sm font-semibold text-gray-700 mb-3">Platform</p>
      <div className="flex flex-col gap-2">
        {PLATFORMS.map(p => (
          <button
            key={p.id}
            onClick={() => onSelect(p.id)}
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl border-2 transition-all text-left ${
              selected === p.id
                ? 'border-teal-500 bg-teal-50 text-teal-800'
                : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
            }`}
          >
            <span className="text-xl">{p.icon}</span>
            <div>
              <p className={`text-sm font-semibold ${selected === p.id ? 'text-teal-700' : 'text-gray-800'}`}>
                {p.label}
              </p>
              <p className="text-xs text-gray-400">{p.size}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
