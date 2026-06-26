'use client';

import { forwardRef } from 'react';
import type { Post, Platform } from '@/lib/types';
import { BACKGROUNDS } from '@/lib/backgrounds';
import pkb from '@/data/pkb.json';

interface PostCanvasProps {
  post: Post;
  platform: Platform;
  bgIndex: number;
  logoUrl?: string;
  editedHook?: string;
  editedSolution?: string;
}

const PostCanvas = forwardRef<HTMLDivElement, PostCanvasProps>(function PostCanvas(
  { post, platform, bgIndex, logoUrl, editedHook },
  ref
) {
  const bg = BACKGROUNDS[bgIndex] ?? BACKGROUNDS[0];
  const isLight = bg.textColor === 'light'; // 'light' => light text on a DARK background
  const accent = bg.accentColor;

  // Base colour to fade the hero image into (last stop of the bg gradient).
  const baseColor =
    bg.css.match(/#[0-9a-fA-F]{6}/g)?.slice(-1)[0] ?? (isLight ? '#0a0a0a' : '#ffffff');
  // Express it as rgba() — html2canvas mis-parses the `transparent` keyword and
  // 8-digit hex in gradients (causes a non-finite addColorStop crash on export).
  const _bh = baseColor.replace('#', '');
  const _br = parseInt(_bh.slice(0, 2), 16) || 0;
  const _bg = parseInt(_bh.slice(2, 4), 16) || 0;
  const _bb = parseInt(_bh.slice(4, 6), 16) || 0;
  const baseRgba = (a: number) => `rgba(${_br}, ${_bg}, ${_bb}, ${a})`;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const product = (pkb as any[]).find((p: any) => p.id === post.productId);
  const heroIngredients: string[] = product?.heroIngredients?.slice(0, 3) ?? [];
  const positioningLine: string = product?.positioningLine ?? '';

  const hookText = editedHook ?? post.content.hookText;
  const hasImage = !!post.productImageUrl;

  // ── Layout proportions ──
  const isTall = platform !== 'linkedin'; // 9:16 for IG Reel + YT Short, 4:5 for LinkedIn
  const aspectClass = isTall ? 'aspect-[9/16]' : 'aspect-[4/5]';
  // Give the 4:5 LinkedIn card a taller hero so the product is showcased fully
  // (a short hero crops it into a wide sliver, which reads as "stretched").
  const heroHeight = isTall ? '56%' : '52%';
  const contentTop = isTall ? '50%' : '47%'; // content overlaps the faded image edge

  // ── Content-adaptive type sizing — longer copy shrinks so nothing overflows ──
  const hookLen = (hookText || '').trim().length;
  const hookFontSize =
    hookLen > 150 ? 'clamp(15px, 4.6cqw, 26px)'
    : hookLen > 105 ? 'clamp(17px, 5.2cqw, 30px)'
    : 'clamp(19px, 6cqw, 34px)';

  const benefitFontSize =
    (positioningLine || '').trim().length > 70 ? 'clamp(9px, 2.7cqw, 15px)' : 'clamp(10px, 3cqw, 16px)';

  // ── Colour tokens ──
  const textPrimary = isLight ? '#ffffff' : '#0f172a';
  const textSecondary = isLight ? 'rgba(255,255,255,0.80)' : 'rgba(15,23,42,0.66)';
  const brandOnImage = '#ffffff';

  return (
    <div
      ref={ref}
      id="post-canvas"
      className={`relative w-full ${aspectClass} overflow-hidden select-none`}
      style={{
        background: bg.css,
        borderRadius: '22px',
        fontFamily: "'Inter', 'SF Pro Display', system-ui, sans-serif",
        containerType: 'inline-size',
      }}
    >
      {/* ── HERO IMAGE — full bleed across the top ── */}
      {hasImage && (
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: heroHeight, overflow: 'hidden' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.productImageUrl}
            alt={post.productName}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
          {/* Fade the bottom of the image seamlessly into the background colour.
              Uses zero-alpha of the SAME colour (not `transparent`) — html2canvas
              renders the `transparent` keyword as opaque black, causing dark bands. */}
          <div style={{
            position: 'absolute', inset: 0,
            background: `linear-gradient(to bottom, ${baseRgba(0)} 36%, ${baseRgba(0.72)} 68%, ${baseRgba(1)} 100%)`,
          }} />
          {/* Soft top vignette so the brand row stays legible over any photo */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: '34%',
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.42) 0%, rgba(0,0,0,0) 100%)',
          }} />
        </div>
      )}

      {/* ── BRAND ROW — overlaid at the very top ── */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 3,
        padding: '6% 7% 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        {logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logoUrl} alt="Logo" style={{ height: 'clamp(34px, 11cqw, 56px)', width: 'auto', maxWidth: '50%', objectFit: 'contain' }} />
        ) : (
          <div className="flex items-center" style={{ gap: '7px' }}>
            <div style={{
              width: 'clamp(26px, 8cqw, 38px)', height: 'clamp(26px, 8cqw, 38px)', borderRadius: '9px',
              background: accent, display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 'clamp(13px, 4cqw, 19px)', fontWeight: '900', color: '#0f172a',
              boxShadow: '0 2px 10px rgba(0,0,0,0.25)',
            }}>Z</div>
            <span style={{
              fontSize: 'clamp(12px, 3.6cqw, 17px)', fontWeight: '800', color: brandOnImage,
              letterSpacing: '0.14em', textTransform: 'uppercase',
              textShadow: hasImage ? '0 1px 6px rgba(0,0,0,0.5)' : 'none',
            }}>Zeshto</span>
          </div>
        )}
        <span style={{
          fontSize: 'clamp(8px, 2.5cqw, 12px)', fontWeight: '700',
          color: hasImage ? 'rgba(255,255,255,0.92)' : textSecondary,
          letterSpacing: '0.02em',
          textShadow: hasImage ? '0 1px 6px rgba(0,0,0,0.5)' : 'none',
        }}>
          @zeshtonaturalsoap
        </span>
      </div>

      {/* ── CONTENT — lower area ── */}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0,
        top: hasImage ? contentTop : '0',
        zIndex: 2, display: 'flex', flexDirection: 'column',
        padding: '0 7% 6.5%',
      }}>
        {/* push content to start a touch lower when there's no image */}
        {!hasImage && <div style={{ height: '14%', flexShrink: 0 }} />}

        {/* Eyebrow — product name */}
        <p style={{
          margin: '0 0 2.5% 0', flexShrink: 0,
          fontSize: 'clamp(9px, 2.7cqw, 13px)', fontWeight: '800',
          color: accent, letterSpacing: '0.16em', textTransform: 'uppercase',
        }}>
          {post.productName}
        </p>

        {/* Hook — the scroll-stopper */}
        <p style={{
          margin: 0, flexShrink: 0,
          fontSize: hookFontSize, fontWeight: '800', lineHeight: '1.16',
          color: textPrimary, letterSpacing: '-0.025em',
        }}>
          {hookText}
        </p>

        {/* Ingredient line */}
        {heroIngredients.length > 0 && (
          <div style={{
            marginTop: '4%', flexShrink: 0,
            display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '6px',
          }}>
            {heroIngredients.map((ing, i) => (
              <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {i > 0 && <span style={{ color: accent, opacity: 0.6, fontSize: 'clamp(8px, 2cqw, 11px)' }}>•</span>}
                <span style={{
                  fontSize: 'clamp(8px, 2.4cqw, 12px)', fontWeight: '700',
                  color: accent, letterSpacing: '0.06em', textTransform: 'uppercase',
                }}>{ing}</span>
              </span>
            ))}
          </div>
        )}

        {/* Benefit line */}
        {positioningLine && (
          <p style={{
            marginTop: '2.5%', flexShrink: 0,
            fontSize: benefitFontSize, fontWeight: '500', lineHeight: '1.4',
            color: textSecondary, letterSpacing: '-0.005em',
          }}>
            {positioningLine}
          </p>
        )}

        {/* flexible spacer pushes the CTA to the bottom */}
        <div style={{ flex: 1, minHeight: '4%' }} />

        {/* CTA pill */}
        <div style={{
          flexShrink: 0,
          background: accent, borderRadius: '999px',
          padding: '3.5% 6%', textAlign: 'center',
          boxShadow: `0 6px 22px ${accent}40`,
        }}>
          <span style={{
            fontSize: 'clamp(10px, 3cqw, 16px)', fontWeight: '800',
            color: '#0f172a', letterSpacing: '0.01em',
          }}>
            Handmade for Indian skin · zeshto.com
          </span>
        </div>

        {/* footer handle */}
        <p style={{
          margin: '3% 0 0 0', flexShrink: 0, textAlign: 'center',
          fontSize: 'clamp(8px, 2.3cqw, 12px)', fontWeight: '600',
          color: textSecondary, letterSpacing: '0.04em',
        }}>
          📸 @zeshtonaturalsoap   🌐 www.zeshto.com
        </p>
      </div>
    </div>
  );
});

export default PostCanvas;
