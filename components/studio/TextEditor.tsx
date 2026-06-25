'use client';

interface TextEditorProps {
  hookText: string;
  solutionText: string;
  onChange: (field: 'hookText' | 'solutionText', value: string) => void;
}

export default function TextEditor({ hookText, solutionText, onChange }: TextEditorProps) {
  return (
    <div>
      <p className="text-sm font-semibold text-gray-700 mb-3">Edit text on image</p>
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1.5">Hook (big text)</label>
          <textarea
            value={hookText}
            onChange={e => onChange('hookText', e.target.value)}
            rows={3}
            className="w-full px-3 py-2.5 rounded-xl border-2 border-gray-200 focus:border-teal-500 focus:outline-none text-sm resize-none"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1.5">Solution text</label>
          <textarea
            value={solutionText}
            onChange={e => onChange('solutionText', e.target.value)}
            rows={4}
            className="w-full px-3 py-2.5 rounded-xl border-2 border-gray-200 focus:border-teal-500 focus:outline-none text-sm resize-none"
          />
        </div>
      </div>
      <p className="text-xs text-gray-400 mt-2">
        Tap any text to edit. Changes show live in the preview above.
      </p>
    </div>
  );
}
