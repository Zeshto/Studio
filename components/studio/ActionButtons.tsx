'use client';

import { useEffect, useRef, useState } from 'react';
import BigButton from '@/components/ui/BigButton';
import { Toast } from '@/components/ui/Toast';
import type { Post, Platform } from '@/lib/types';
import { getPlatformOutput } from '@/lib/platformAdapter';

interface ActionButtonsProps {
  post: Post;
  platform: Platform;
  canvasId?: string;
  // These let us re-capture the share image whenever the canvas changes.
  bgIndex?: number;
  editedHook?: string;
  editedSolution?: string;
}

// ── Robust clipboard copy: modern API first, legacy execCommand fallback ──
// navigator.clipboard is blocked on many mobile/in-app browsers, so we always
// have the textarea fallback (which also works inside a user gesture on iOS).
async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* fall through to legacy path */
  }
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.top = '0';
    ta.style.left = '0';
    ta.style.width = '1px';
    ta.style.height = '1px';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    ta.setSelectionRange(0, text.length); // iOS needs an explicit range
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

export default function ActionButtons({
  post,
  platform,
  canvasId = 'post-canvas',
  bgIndex,
  editedHook,
  editedSolution,
}: ActionButtonsProps) {
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [recording, setRecording] = useState(false);

  // Pre-captured image for instant sharing (keeps the user gesture alive so the
  // native share sheet opens instead of silently falling back to download).
  const shareFileRef = useRef<File | null>(null);

  const output = getPlatformOutput(post, platform);

  function showToast(message: string, type: 'success' | 'error' = 'success') {
    setToast({ message, type });
  }

  // Renders the post card to a pixel-perfect canvas at the platform's exact
  // target size (used by both the image and the video export).
  async function captureSourceCanvas(): Promise<HTMLCanvasElement | null> {
    try {
      const { default: html2canvas } = await import('html2canvas');
      const el = document.getElementById(canvasId);
      if (!el || el.offsetWidth === 0) return null;

      const { width: targetW, height: targetH } = output.dimensions;
      const ow = el.offsetWidth;
      // Pin an explicit pixel height matching the TARGET ratio — html2canvas
      // mishandles CSS `aspect-ratio` on clone (stretches/cuts the output).
      const oh = Math.round((ow * targetH) / targetW);
      const scale = targetW / ow;

      return await html2canvas(el, {
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
            c.style.borderRadius = '0';
            c.style.aspectRatio = 'auto';
            c.style.height = `${oh}px`;
            c.style.width = `${ow}px`;
          }
        },
      });
    } catch (err) {
      console.error('Canvas capture error:', err);
      return null;
    }
  }

  async function captureBlob(): Promise<Blob | null> {
    const canvas = await captureSourceCanvas();
    if (!canvas) return null;
    // JPEG keeps the file small (~200KB vs ~1MB PNG).
    return await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.9));
  }

  // ── 10-second video export (for YouTube Shorts / Reels — they require video) ──
  // Records the post card with a slow Ken-Burns zoom so it's a real video clip,
  // not a frozen frame.
  async function handleVideo() {
    if (typeof MediaRecorder === 'undefined') {
      showToast('This browser can’t make videos. Open the app in Chrome.', 'error');
      return;
    }
    setRecording(true);
    try {
      const source = await captureSourceCanvas();
      if (!source) {
        showToast('Could not create the video. Please try again.', 'error');
        return;
      }

      const rec = document.createElement('canvas');
      rec.width = source.width;
      rec.height = source.height;
      const ctx = rec.getContext('2d');
      if (!ctx) {
        showToast('Could not create the video. Please try again.', 'error');
        return;
      }
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, rec.width, rec.height);
      ctx.drawImage(source, 0, 0);

      const mimeCandidates = [
        'video/mp4;codecs=avc1',
        'video/mp4',
        'video/webm;codecs=vp9',
        'video/webm;codecs=vp8',
        'video/webm',
      ];
      const mime =
        mimeCandidates.find(m => MediaRecorder.isTypeSupported?.(m)) || 'video/webm';
      const stream = rec.captureStream(30);
      const recorder = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 6_000_000 });
      const chunks: BlobPart[] = [];
      recorder.ondataavailable = e => { if (e.data && e.data.size) chunks.push(e.data); };
      const stopped = new Promise<void>(resolve => { recorder.onstop = () => resolve(); });
      recorder.start();

      const DURATION = 10000; // 10 seconds
      const startedAt = performance.now();
      await new Promise<void>(resolve => {
        const draw = (now: number) => {
          const t = Math.min((now - startedAt) / DURATION, 1);
          const zoom = 1 + 0.08 * t; // gentle zoom from 1.0 → 1.08
          const w = rec.width, h = rec.height;
          const dw = w * zoom, dh = h * zoom;
          ctx.fillStyle = '#000';
          ctx.fillRect(0, 0, w, h);
          ctx.drawImage(source, (w - dw) / 2, (h - dh) / 2, dw, dh);
          if (t < 1) requestAnimationFrame(draw);
          else resolve();
        };
        requestAnimationFrame(draw);
      });

      recorder.stop();
      await stopped;

      const ext = mime.includes('mp4') ? 'mp4' : 'webm';
      const blob = new Blob(chunks, { type: mime });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `zeshto-day-${post.dayNumber}-${platform}.${ext}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 5000);
      showToast(`10-second video saved (.${ext})! Upload it to YouTube Shorts / Reels.`);
    } catch (err) {
      console.error('Video error:', err);
      showToast('Could not create the video. Please try again.', 'error');
    } finally {
      setRecording(false);
    }
  }

  // Re-capture in the background whenever the canvas content changes, so a
  // share is ready to fire instantly on tap.
  useEffect(() => {
    let cancelled = false;
    shareFileRef.current = null;
    const t = setTimeout(async () => {
      const blob = await captureBlob();
      if (cancelled || !blob) return;
      shareFileRef.current = new File([blob], `zeshto-day-${post.dayNumber}.jpg`, {
        type: 'image/jpeg',
      });
    }, 700);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [post.dayNumber, platform, bgIndex, editedHook, editedSolution]);

  function saveBlob(blob: Blob) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `zeshto-day-${post.dayNumber}-${platform}.jpg`;
    a.rel = 'noopener';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  }

  async function handleCopyAll() {
    const full = `${output.caption}\n\n${output.hashtagString}`;
    const ok = await copyText(full);
    showToast(
      ok ? 'Caption + hashtags copied! Paste into Instagram.' : 'Copy blocked — long-press the caption below to copy it.',
      ok ? 'success' : 'error'
    );
  }

  async function handleCopyCaption() {
    const ok = await copyText(output.caption);
    showToast(
      ok ? 'Caption copied!' : 'Copy blocked — long-press the caption below to copy it.',
      ok ? 'success' : 'error'
    );
  }

  async function handleCopyHashtags() {
    const ok = await copyText(output.hashtagString);
    showToast(
      ok ? 'Hashtags copied!' : 'Copy blocked — long-press the hashtags below to copy them.',
      ok ? 'success' : 'error'
    );
  }

  async function handleDownload() {
    setDownloading(true);
    try {
      const blob = shareFileRef.current ? await shareFileRef.current.arrayBuffer().then(b => new Blob([b], { type: 'image/jpeg' })) : await captureBlob();
      if (!blob) {
        showToast('Could not create image. Please try again.', 'error');
        return;
      }
      saveBlob(blob);
      showToast('Image saved! Check your Downloads (and Photos › Download album).');
    } finally {
      setDownloading(false);
    }
  }

  async function handleShare() {
    // FAST PATH — share the pre-captured image immediately. Calling
    // navigator.share synchronously at the top of the handler preserves the
    // user gesture, so the share sheet (Instagram / YouTube / LinkedIn / etc.)
    // opens instead of falling back to a download.
    const cached = shareFileRef.current;
    if (cached && navigator.share && navigator.canShare?.({ files: [cached] })) {
      try {
        await navigator.share({
          files: [cached],
          title: `Zeshto · Day ${post.dayNumber}`,
          text: `${output.caption}\n\n${output.hashtagString}`,
        });
        return;
      } catch (err) {
        if ((err as Error)?.name === 'AbortError') return; // user closed the sheet
        // otherwise fall through to capture/download
      }
    }

    setSharing(true);
    try {
      const blob = cached
        ? await cached.arrayBuffer().then(b => new Blob([b], { type: 'image/jpeg' }))
        : await captureBlob();
      if (!blob) {
        showToast('Could not create image. Please try Download.', 'error');
        return;
      }
      const file = new File([blob], `zeshto-day-${post.dayNumber}.jpg`, { type: 'image/jpeg' });

      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: `Zeshto · Day ${post.dayNumber}`,
            text: `${output.caption}\n\n${output.hashtagString}`,
          });
          return;
        } catch (err) {
          if ((err as Error)?.name === 'AbortError') return;
        }
      }

      // No native file-sharing (e.g. desktop) → save the image instead.
      saveBlob(blob);
      showToast('Sharing isn’t available here — image saved to Downloads. Open Instagram/YouTube/LinkedIn and upload it.');
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

        {/* Format guide — makes sure the right shape goes to the right place */}
        <div className="rounded-xl bg-teal-50 border border-teal-100 px-3 py-2 text-xs text-teal-800">
          {platform === 'instagram' && (
            <>📱 <b>Instagram Reel</b> · 9:16 ({output.dimensions.label}) — post to <b>Reels / Stories</b>.</>
          )}
          {platform === 'youtube' && (
            <>▶️ <b>YouTube Short</b> · 9:16 ({output.dimensions.label}) — YouTube only accepts <b>video</b>, so use <b>“Save as Video”</b> below, then upload it as a Short.</>
          )}
          {platform === 'linkedin' && (
            <>💼 <b>LinkedIn</b> · 4:5 ({output.dimensions.label}) — post as a <b>feed image</b>. Don’t use this one for a Reel/Short (it would stretch).</>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <BigButton onClick={handleDownload} loading={downloading} icon="⬇️" variant="primary">
            Download Image
          </BigButton>

          <BigButton onClick={handleShare} loading={sharing} icon="📤" variant="secondary">
            Share
          </BigButton>
        </div>

        {/* Video export — required for YouTube Shorts, also great for Reels */}
        <BigButton onClick={handleVideo} loading={recording} icon="🎬" variant="primary">
          {recording ? 'Making your 10s video…' : 'Save as Video (10s) · for YouTube / Reels'}
        </BigButton>

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

        {/* Caption preview — selectable so it can always be copied manually as a last resort */}
        <div className="bg-gray-50 rounded-xl p-3 mt-2" style={{ userSelect: 'text', WebkitUserSelect: 'text' }}>
          <p className="text-xs font-semibold text-gray-500 mb-1.5">Caption preview (long-press to select)</p>
          <p className="text-xs text-gray-700 whitespace-pre-line" style={{ userSelect: 'text', WebkitUserSelect: 'text' }}>
            {output.caption}
          </p>
          <p className="text-xs text-teal-600 mt-2 font-medium" style={{ userSelect: 'text', WebkitUserSelect: 'text' }}>
            {output.hashtagString}
          </p>
        </div>
      </div>
    </>
  );
}
