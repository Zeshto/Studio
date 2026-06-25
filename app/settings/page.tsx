'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import BigButton from '@/components/ui/BigButton';
import { Toast } from '@/components/ui/Toast';

interface Settings {
  bannedPhrases: string[];
  disclaimer: string;
  logoUrl: string;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [disclaimer, setDisclaimer] = useState('');
  const [bannedInput, setBannedInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    fetch('/api/settings')
      .then(r => r.json())
      .then((data: Settings) => {
        setSettings(data);
        setDisclaimer(data.disclaimer || '');
      });
  }, []);

  async function handleSave() {
    if (!settings) return;
    setSaving(true);
    try {
      await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ disclaimer, bannedPhrases: settings.bannedPhrases }),
      });
      setToast({ message: 'Settings saved!', type: 'success' });
    } catch {
      setToast({ message: 'Could not save. Please try again.', type: 'error' });
    } finally {
      setSaving(false);
    }
  }

  function addBannedPhrase() {
    if (!bannedInput.trim() || !settings) return;
    setSettings({ ...settings, bannedPhrases: [...settings.bannedPhrases, bannedInput.trim().toLowerCase()] });
    setBannedInput('');
  }

  function removeBannedPhrase(phrase: string) {
    if (!settings) return;
    setSettings({ ...settings, bannedPhrases: settings.bannedPhrases.filter(p => p !== phrase) });
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {toast && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />}

      {/* Nav */}
      <nav className="bg-white border-b border-gray-200 px-4 py-4 sticky top-0 z-40 shadow-sm">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Link href="/home" className="text-gray-500 hover:text-teal-600 text-xl">←</Link>
          <h1 className="font-bold text-gray-900">Settings</h1>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-6">

        {/* Disclaimer */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="font-bold text-gray-900 mb-1">Disclaimer text</h2>
          <p className="text-sm text-gray-500 mb-4">
            This line is automatically added to every post. It keeps your content legally safe.
          </p>
          <textarea
            value={disclaimer}
            onChange={e => setDisclaimer(e.target.value)}
            rows={3}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-teal-500 focus:outline-none text-sm resize-none"
          />
        </div>

        {/* Banned phrases */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="font-bold text-gray-900 mb-1">Banned phrases</h2>
          <p className="text-sm text-gray-500 mb-4">
            Any generated text containing these phrases will be automatically replaced with safe alternatives.
          </p>

          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={bannedInput}
              onChange={e => setBannedInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addBannedPhrase()}
              placeholder="Add a phrase to ban…"
              className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-teal-500 focus:outline-none text-sm"
            />
            <BigButton onClick={addBannedPhrase} fullWidth={false} className="px-5 py-3 rounded-xl text-sm">
              Add
            </BigButton>
          </div>

          {settings && (
            <div className="flex flex-wrap gap-2">
              {settings.bannedPhrases.map(phrase => (
                <span
                  key={phrase}
                  className="bg-red-50 text-red-700 border border-red-200 px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5"
                >
                  {phrase}
                  <button
                    onClick={() => removeBannedPhrase(phrase)}
                    className="text-red-400 hover:text-red-700 ml-0.5"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* PKB info */}
        <div className="bg-teal-50 border border-teal-200 rounded-2xl p-6">
          <h2 className="font-bold text-teal-900 mb-1">Product Knowledge Base</h2>
          <p className="text-sm text-teal-700 mb-3">
            The PKB contains all 12 Zeshto soap records. Every post is generated from this single source of truth.
            To update a product (price, ingredients, claims), edit the file at <code className="bg-teal-100 px-1 rounded">data/pkb.json</code> and re-deploy.
          </p>
          <p className="text-xs text-teal-600">
            Products loaded: Golden Exfolia, Heritage Glow, Radiance Glow, Rose Revive, Royal Essence, Calm Essence, Fresh Blizz, Purity Guard, CharLuna Glow, Amber Calm, Sandal Radiance, Hair Vitalizer
          </p>
        </div>

        <BigButton onClick={handleSave} loading={saving}>
          Save settings
        </BigButton>
      </main>
    </div>
  );
}
