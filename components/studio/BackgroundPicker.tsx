'use client';

import { BACKGROUNDS } from '@/lib/backgrounds';

interface BackgroundPickerProps {
  selected: number;
  onSelect: (index: number) => void;
}

export default function BackgroundPicker({ selected, onSelect }: BackgroundPickerProps) {
  return (
    <div>
      <p className="text-sm font-semibold text-gray-700 mb-3">Background</p>
      <div className="grid grid-cols-5 gap-2">
        {BACKGROUNDS.map(bg => (
          <button
            key={bg.id}
            onClick={() => onSelect(bg.id)}
            title={bg.name}
            className={`w-full aspect-square rounded-xl transition-all ${
              selected === bg.id
                ? 'ring-2 ring-teal-500 ring-offset-2 scale-105 shadow-lg'
                : 'hover:scale-105 hover:shadow-md'
            }`}
            style={{ background: bg.css }}
          />
        ))}
      </div>
      <p className="text-xs text-gray-400 mt-2 text-center">
        {BACKGROUNDS[selected]?.name}
      </p>
    </div>
  );
}
