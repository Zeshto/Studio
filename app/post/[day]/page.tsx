'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import PostCanvas from '@/components/studio/PostCanvas';
import BackgroundPicker from '@/components/studio/BackgroundPicker';
import PlatformToggle from '@/components/studio/PlatformToggle';
import TextEditor from '@/components/studio/TextEditor';
import LogoUploader from '@/components/studio/LogoUploader';
import ActionButtons from '@/components/studio/ActionButtons';
import BigButton from '@/components/ui/BigButton';
import { Toast } from '@/components/ui/Toast';
import type { Post, Platform } from '@/lib/types';

type Section = 'platform' | 'background' | 'text' | 'logo';

export default function StudioPage() {
  const params = useParams();
  const router = useRouter();
  const day = parseInt(params.day as string, 10);

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [platform, setPlatform] = useState<Platform>('instagram');
  const [bgIndex, setBgIndex] = useState(0);
  const [logoUrl, setLogoUrl] = useState('');
  const [editedHook, setEditedHook] = useState('');
  const [editedSolution, setEditedSolution] = useState('');
  const [regenerating, setRegenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState<Section>('platform');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (!day || isNaN(day)) { router.push('/home'); return; }
    fetch(`/api/posts/${day}`)
      .then(r => r.json())
      .then((data: Post) => {
        setPost(data);
        setBgIndex(data.backgroundIndex ?? 0);
        setLogoUrl(data.logoUrl ?? '');
        setEditedHook(data.content.hookText);
        setEditedSolution(data.content.solutionText);
      })
      .catch(() => setToast({ message: 'Could not load this post.', type: 'error' }))
      .finally(() => setLoading(false));
  }, [day, router]);

  async function handleRegenerate() {
    setRegenerating(true);
    try {
      const res = await fetch(`/api/posts/${day}`, { method: 'POST' });
      const data: Post = await res.json();
      setPost(data);
      setEditedHook(data.content.hookText);
      setEditedSolution(data.content.solutionText);
      setToast({ message: 'New version generated!', type: 'success' });
    } catch {
      setToast({ message: 'Regenerate failed. Please try again.', type: 'error' });
    } finally {
      setRegenerating(false);
    }
  }

  async function handleSave() {
    if (!post) return;
    setSaving(true);
    try {
      const updated: Post = {
        ...post,
        backgroundIndex: bgIndex,
        logoUrl,
        content: {
          ...post.content,
          hookText: editedHook,
          solutionText: editedSolution,
        },
      };
      await fetch(`/api/posts/${day}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      setPost(updated);
      setToast({ message: 'Saved!', type: 'success' });
    } catch {
      setToast({ message: 'Could not save. Please try again.', type: 'error' });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading Day {day}…</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-4xl mb-3">😕</p>
          <p className="text-gray-600 mb-4">Post not found.</p>
          <Link href="/home" className="text-teal-600 font-semibold">← Back to home</Link>
        </div>
      </div>
    );
  }

  const SECTIONS: { id: Section; label: string; icon: string }[] = [
    { id: 'platform', label: 'Platform', icon: '📱' },
    { id: 'background', label: 'Background', icon: '🎨' },
    { id: 'text', label: 'Edit Text', icon: '✏️' },
    { id: 'logo', label: 'Logo', icon: '🏷️' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {toast && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />}

      {/* Top nav */}
      <nav className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-40 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/home" className="text-gray-500 hover:text-teal-600 text-xl">←</Link>
            <div>
              <h1 className="font-bold text-gray-900 text-sm leading-none">Day {day}</h1>
              <p className="text-xs text-gray-400 mt-0.5">{post.productName}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <BigButton
              onClick={handleRegenerate}
              loading={regenerating}
              variant="ghost"
              fullWidth={false}
              className="text-sm px-4 py-2.5 rounded-xl"
            >
              🔄 Regenerate
            </BigButton>
            <BigButton
              onClick={handleSave}
              loading={saving}
              variant="primary"
              fullWidth={false}
              className="text-sm px-4 py-2.5 rounded-xl"
            >
              Save
            </BigButton>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

          {/* LEFT — Live canvas preview */}
          <div className="sticky top-20">
            <div className="max-w-xs mx-auto">
              <PostCanvas
                post={post}
                platform={platform}
                bgIndex={bgIndex}
                logoUrl={logoUrl}
                editedHook={editedHook}
                editedSolution={editedSolution}
              />
            </div>

            {/* Action buttons (below canvas on mobile, below preview on desktop) */}
            <div className="mt-6">
              <ActionButtons post={post} platform={platform} />
            </div>
          </div>

          {/* RIGHT — Controls */}
          <div className="space-y-4">
            {/* Section tabs */}
            <div className="grid grid-cols-4 gap-2 bg-white rounded-2xl p-2 border border-gray-200">
              {SECTIONS.map(s => (
                <button
                  key={s.id}
                  onClick={() => setActiveSection(s.id)}
                  className={`flex flex-col items-center gap-1 py-2 px-1 rounded-xl text-xs font-semibold transition-all ${
                    activeSection === s.id
                      ? 'bg-teal-500 text-white shadow'
                      : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-lg">{s.icon}</span>
                  {s.label}
                </button>
              ))}
            </div>

            {/* Section content */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              {activeSection === 'platform' && (
                <PlatformToggle selected={platform} onSelect={setPlatform} />
              )}
              {activeSection === 'background' && (
                <BackgroundPicker selected={bgIndex} onSelect={setBgIndex} />
              )}
              {activeSection === 'text' && (
                <TextEditor
                  hookText={editedHook}
                  solutionText={editedSolution}
                  onChange={(field, val) => {
                    if (field === 'hookText') setEditedHook(val);
                    else setEditedSolution(val);
                  }}
                />
              )}
              {activeSection === 'logo' && (
                <LogoUploader logoUrl={logoUrl} onUpload={setLogoUrl} />
              )}
            </div>

            {/* Post details */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-700 mb-3 text-sm">Post details</h3>
              <div className="space-y-2 text-xs text-gray-500">
                <div className="flex justify-between">
                  <span>Soap</span>
                  <span className="font-semibold text-gray-800">{post.productName}</span>
                </div>
                <div className="flex justify-between">
                  <span>Emotion</span>
                  <span className="font-semibold text-gray-800 capitalize">{post.emotionType}</span>
                </div>
                <div className="flex justify-between">
                  <span>Safety check</span>
                  <span className="text-green-600 font-semibold">✅ Passed</span>
                </div>
                <div className="flex justify-between">
                  <span>Status</span>
                  <span className={post.isEdited ? 'text-teal-600 font-semibold' : 'text-gray-400'}>
                    {post.isEdited ? 'Edited' : 'Original'}
                  </span>
                </div>
              </div>
            </div>

            {/* Full content preview */}
            <details className="bg-white rounded-2xl border border-gray-200">
              <summary className="p-5 text-sm font-semibold text-gray-700 cursor-pointer select-none">
                📄 Full post content
              </summary>
              <div className="px-5 pb-5 space-y-4 text-xs text-gray-600">
                <div>
                  <p className="font-semibold text-gray-800 mb-1">Hook</p>
                  <p className="bg-gray-50 rounded-xl p-3 leading-relaxed">{post.content.hookText}</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-800 mb-1">Relate</p>
                  <p className="bg-gray-50 rounded-xl p-3 leading-relaxed">{post.content.relateText}</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-800 mb-1">Insight</p>
                  <p className="bg-gray-50 rounded-xl p-3 leading-relaxed">{post.content.insightText}</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-800 mb-1">Solution</p>
                  <p className="bg-gray-50 rounded-xl p-3 leading-relaxed">{post.content.solutionText}</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-800 mb-1">Transformation</p>
                  <p className="bg-gray-50 rounded-xl p-3 leading-relaxed">{post.content.transformationText}</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-800 mb-1">CTA</p>
                  <p className="bg-gray-50 rounded-xl p-3 leading-relaxed">{post.content.ctaText}</p>
                </div>
              </div>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
}
