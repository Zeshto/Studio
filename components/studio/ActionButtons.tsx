'use client';

import { useState } from 'react';
import BigButton from '@/components/ui/BigButton';
import { Toast } from '@/components/ui/Toast';
import type { Post, Platform } from '@/lib/types';
import { getPlatformOutput } from '@/lib/platformAdapter';

interface ActionButtonsProps {
  post: Post;
  platform: Platform;
  canvasId?: string;
}

export default function ActionButtons({ post, platform, canvasId = 'post-canvas' }: ActionButtonsProps) {
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [sharing, setSharing] = useState(false);

  const output = getPlatformOutput(post, platform);

  function showToast(message: string, type: 'success' | 'error' = 'success') {
    setToast({ message, type });
  }

  async function handleCopyAll() {
    try {
      const full = `${output.caption}\n\n${output.hashtagString}`;
      await navigator.clipboard.writeText(full);
      showToast('Caption + hashtags copied! Paste directly into Instagram.');
    } catch {
      showToast('Could not copy. Please copy manually.', 'error');
    }
  }

  async function handleCopyCaption() {
    try {
      await navigator.clipboard.writeText(output.caption);
      showToast('Caption copied! Paste it into your post.');
    } catch {
      showToast('Could not copy. Please copy manually.', 'error');
    }
  }

  async function handleCopyHashtags() {
    try {
      await navigator.clipboard.writeText(output.hashtagString);
      showToast('Hashtags copied! Paste below your caption.');
    } catch {
      showToast('Could not copy. Please copy manually.', 'error');
    }
  }

  async function captureCanvas(): Promise<Blob | null> {
    try {
      const { default: html2canvas } = await import('html2canvas');
      const el = document.getElementById(canvasId);
      if (!el) return null;

      const { width: targetW, height: targetH } = output.dimensions;
      const ow = el.offsetWidth;
      // Derive the height from the TARGET aspect ratio, not the element's
      // rendered height. html2canvas mishandles CSS `aspect-ratio` when it
      // clones the node (the height collapses → stretched/cut output), so we
      // pin an explicit pixel height that exactly matches the 9:16 / 4:5 frame.
      const oh = Math.round((ow * targetH) / targetW);
      const scale = targetW / ow;

      const canvas = await html2canvas(el, {
        scale,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#000000',
        width: ow,
        height: oh,
        windowWidth: ow,
        windowHeight: oh,
        onclone: (doc: Document) => {
          const c = doc.getElementById(canvasId) as HTMLElement | null;
          if (c) {
            // Square corners (rounded would become black wedges in a Reel) and
            // an explicit height so the clone renders at the exact frame size.
            c.style.borderRadius = '0';
            c.style.aspectRatio = 'auto';
            c.style.height = `${oh}px`;
            c.style.width = `${ow}px`;
          }
        },
      });

      // JPEG keeps the file small (~200KB vs ~1MB PNG) — ideal for phone uploads.
      return new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.9));
    } catch (err) {
      console.error('Canvas capture error:', err);
      return null;
    }
  }

  function saveBlob(blob: Blob) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `zeshto-day-${post.dayNumber}-${platform}.jpg`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleDownload() {
    setDownloading(true);
    try {
      const blob = await captureCanvas();
      if (!blob) {
        showToast('Could not capture image. Please try again.', 'error');
        return;
      }
      saveBlob(blob);
      showToast('Image saved to your downloads!');
    } finally {
      setDownloading(false);
    }
  }

  async function handleShare() {
    setSharing(true);
    try {
      const blob = await captureCanvas();
      if (!blob) {
        showToast('Could not create image. Please try Download.', 'error');
        return;
      }

      const file = new File([blob], `zeshto-day-${post.dayNumber}.jpg`, { type: 'image/jpeg' });

      // Try the native share sheet (best on phones — opens Instagram/WhatsApp directly).
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: `Zeshto - Day ${post.dayNumber}`,
            text: output.caption,
          });
          showToast('Shared successfully!');
          return;
        } catch (err: unknown) {
          // User dismissed the share sheet — not an error, just stop quietly.
          if ((err as Error)?.name === 'AbortError') return;
          // Any other failure (gesture timeout, unsupported browser): fall through
          // to download so the user always gets a usable image.
        }
      }

      // Fallback: save the image so it can be posted manually.
      saveBlob(blob);
      showToast('Image saved — now open Instagram and upload it.');
    } catch {
      showToast('Could not share. Please use the Download button.', 'error');
    } finally {
      setSharing(false);
    }
  }

  return (
    <>
      {toast && (
        <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />
      )}

      <div className="space-y-3">
        <p className="text-sm font-semibold text-gray-700">Post manually</p>

        <div className="grid grid-cols-2 gap-3">
          <BigButton
            onClick={handleDownload}
            loading={downloading}
            icon="⬇️"
            variant="primary"
          >
            Download
          </BigButton>

          <BigButton
            onClick={handleShare}
            loading={sharing}
            icon="🔗"
            variant="secondary"
          >
            Share
          </BigButton>
        </div>

        <BigButton onClick={handleCopyAll} icon="📋" variant="primary">
          Copy Caption + Hashtags
        </BigButton>

        <div className="grid grid-cols-2 gap-3">
          <BigButton onClick={handleCopyCaption} icon="✏️" variant="ghost">
            Caption only
          </BigButton>
          <BigButton onClick={handleCopyHashtags} icon="#️⃣" variant="ghost">
            Hashtags only
          </BigButton>
        </div>

        {/* Caption preview */}
        <div className="bg-gray-50 rounded-xl p-3 mt-2">
          <p className="text-xs font-semibold text-gray-500 mb-1.5">Caption preview</p>
          <p className="text-xs text-gray-700 whitespace-pre-line line-clamp-6">
            {output.caption}
          </p>
          <p className="text-xs text-teal-600 mt-2 font-medium">{output.hashtagString}</p>
        </div>
      </div>
    </>
  );
}
