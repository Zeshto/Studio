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
  const isLight = bg.textColor === 'light';
  const accent = bg.accentColor;

  const product = (pkb as any[]).find((p: any) => p.id === post.productId);
  const heroIngredients: string[] = product?.heroIngredients?.slice(0, 4) ?? [];
  const positioningLine: string = product?.positioningLine ?? '';

  const hookText = editedHook ?? post.content.hookText;
  const hasImage = !!post.productImageUrl;

  // Colour tokens
  const textPrimary   = isLight ? '#ffffff' : '#111827';
  const textSecondary = isLight ? 'rgba(255,255,255,0.68)' : '#4b5563';
  const textTertiary  = isLight ? 'rgba(255,255,255,0.38)' : 'rgba(0,0,0,0.28)';
  const frameBorder   = isLight ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.12)';
  const dividerColor  = isLight ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.09)';
  const ctaBg         = isLight ? '#ffffff' : '#0d6b66';
  const ctaText       = isLight ? '#0d6b66' : '#ffffff';

  const aspectClass = platform === 'youtube' ? 'aspect-[9/16]' : 'aspect-[4/5]';

  return (
    <div
      ref={ref}
      id="post-canvas"
      className={`relative w-full ${aspectClass} overflow-hidden select-none`}
      style={{
        background: bg.css,
        borderRadius: '20px',
        fontFamily: "'Inter', 'SF Pro Display', system-ui, sans-serif",
      }}
    >
      {/* Atmospheric glow */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: isLight
          ? 'radial-gradient(ellipse at 15% 8%, rgba(255,255,255,0.20) 0%, transparent 50%)'
          : 'radial-gradient(ellipse at 85% 92%, rgba(255,255,255,0.07) 0%, transparent 50%)',
      }} />

      {/* Corner circles — decorative */}
      <div className="absolute pointer-events-none" style={{
        width: '40%', paddingBottom: '40%', borderRadius: '50%',
        top: '-10%', right: '-10%',
        border: `1.5px solid ${isLight ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.05)'}`,
      }} />
      <div className="absolute pointer-events-none" style={{
        width: '25%', paddingBottom: '25%', borderRadius: '50%',
        top: '-4%', right: '-4%',
        border: `1px solid ${isLight ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.04)'}`,
      }} />

      {/* Dot cluster — bottom left */}
      <div className="absolute pointer-events-none" style={{ bottom: '7%', left: '5%' }}>
        {[0, 1, 2].map(row => (
          <div key={row} style={{ display: 'flex', gap: '5px', marginBottom: '5px' }}>
            {[0, 1, 2].map(col => (
              <div key={col} style={{
                width: '2.5px', height: '2.5px', borderRadius: '50%',
                background: accent,
                opacity: Math.max(0.05, 0.22 - row * 0.05 - col * 0.03),
              }} />
            ))}
          </div>
        ))}
      </div>

      {/* Inner frame */}
      <div className="absolute pointer-events-none" style={{
        inset: '3.5%', borderRadius: '14px',
        border: `1px solid ${frameBorder}`,
      }} />

      {/* ── MAIN CONTENT FLEX COLUMN ── */}
      <div className="absolute inset-0 flex flex-col" style={{ padding: '7% 7% 0 7%' }}>

        {/* ── HEADER: Logo + accent ── */}
        <div style={{ marginBottom: hasImage ? '4%' : '5%', flexShrink: 0 }}>
          <div className="flex items-center justify-between">
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoUrl} alt="Logo" style={{ height: '26px', width: 'auto', maxWidth: '85px', objectFit: 'contain', borderRadius: '5px' }} />
            ) : (
              <div className="flex items-center" style={{ gap: '6px' }}>
                <div style={{
                  width: '26px', height: '26px', borderRadius: '7px',
                  background: isLight ? 'rgba(255,255,255,0.22)' : '#0d6b66',
                  border: `1.5px solid ${isLight ? 'rgba(255,255,255,0.38)' : 'transparent'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '11px', fontWeight: '800', color: '#ffffff',
                }}>Z</div>
                <span style={{ fontSize: 'clamp(10px, 2.6vw, 12px)', fontWeight: '700', color: textPrimary, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  Zeshto
                </span>
              </div>
            )}
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: accent, opacity: 0.75 }} />
          </div>
          {/* Accent rule */}
          <div style={{
            marginTop: '4%', height: '1px',
            background: `linear-gradient(to right, ${accent}66, ${accent}22, transparent)`,
          }} />
        </div>

        {/* ── PRODUCT IMAGE (shown when available) ── */}
        {hasImage && (
          <div style={{
            flexShrink: 0,
            marginBottom: '4%',
            borderRadius: '12px',
            overflow: 'hidden',
            position: 'relative',
            height: '32%',
            border: `1.5px solid ${isLight ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.12)'}`,
            boxShadow: isLight
              ? '0 8px 32px rgba(0,0,0,0.28), 0 2px 8px rgba(0,0,0,0.18)'
              : '0 8px 32px rgba(0,0,0,0.45), 0 2px 8px rgba(0,0,0,0.30)',
          }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.productImageUrl}
              alt={post.productName}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
            {/* Bottom gradient on image — blends into background */}
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0, height: '40%',
              background: isLight
                ? 'linear-gradient(to top, rgba(0,0,0,0.35) 0%, transparent 100%)'
                : 'linear-gradient(to top, rgba(0,0,0,0.50) 0%, transparent 100%)',
            }} />
            {/* Product name overlay at bottom-left of image */}
            <div style={{
              position: 'absolute', bottom: '8px', left: '10px',
              fontSize: 'clamp(8px, 2vw, 10px)',
              fontWeight: '600',
              color: 'rgba(255,255,255,0.90)',
              letterSpacing: '0.04em',
              textShadow: '0 1px 4px rgba(0,0,0,0.5)',
            }}>
              {post.productName}
            </div>
          </div>
        )}

        {/* ── HOOK TEXT ── */}
        <div style={{
          flexShrink: 0,
          marginBottom: '4%',
          position: 'relative',
          paddingLeft: '13px',
        }}>
          {/* Left accent strip */}
          <div style={{
            position: 'absolute', left: 0, top: '3px', bottom: '3px',
            width: '3px', borderRadius: '2px',
            background: `linear-gradient(to bottom, ${accent}, ${accent}44)`,
          }} />
          {/* Decorative quote */}
          <div style={{
            position: 'absolute', top: '-6px', left: '10px',
            fontSize: 'clamp(24px, 7vw, 38px)', fontWeight: '900',
            color: accent, opacity: 0.15, lineHeight: 1,
            fontFamily: 'Georgia, serif', userSelect: 'none',
          }}>"</div>
          <p style={{
            fontSize: hasImage ? 'clamp(11px, 3.6vw, 17px)' : 'clamp(13px, 4.4vw, 21px)',
            fontWeight: '800',
            lineHeight: '1.28',
            color: textPrimary,
            margin: 0,
            letterSpacing: '-0.02em',
          }}>
            {hookText}
          </p>
        </div>

        {/* ── DIVIDER ── */}
        <div style={{ height: '1px', background: dividerColor, marginBottom: '4%', flexShrink: 0 }} />

        {/* ── PRODUCT NAME (no-image path only) ── */}
        {!hasImage && (
          <div style={{ marginBottom: '3%', flexShrink: 0 }}>
            <p style={{
              fontSize: 'clamp(12px, 3.4vw, 16px)', fontWeight: '800',
              color: textPrimary, margin: '0 0 4px 0', letterSpacing: '-0.01em',
            }}>
              {post.productName}
            </p>
            <div style={{ width: '28px', height: '2px', borderRadius: '1px', background: accent, opacity: 0.7 }} />
          </div>
        )}

        {/* ── SOLUTION BLOCK ── */}
        {heroIngredients.length > 0 && (
          <div style={{
            flexShrink: 0,
            marginBottom: '4%',
            borderRadius: '10px',
            padding: '4% 5%',
            background: isLight ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.28)',
            border: `1px solid ${accent}33`,
          }}>
            {/* Ingredient badges */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 8px', marginBottom: '5px' }}>
              {heroIngredients.map((ingredient: string, i: number) => (
                <span key={i} style={{
                  fontSize: 'clamp(7px, 1.8vw, 9px)',
                  fontWeight: '800',
                  color: accent,
                  letterSpacing: '0.07em',
                  textTransform: 'uppercase',
                }}>
                  {i > 0 && <span style={{ opacity: 0.5, marginRight: '8px' }}>+</span>}
                  {ingredient}
                </span>
              ))}
            </div>
            {/* Benefit tagline */}
            {positioningLine ? (
              <p style={{
                fontSize: 'clamp(9px, 2.6vw, 13px)',
                fontWeight: '700',
                color: '#ffffff',
                margin: 0,
                lineHeight: '1.35',
                letterSpacing: '-0.01em',
              }}>
                {positioningLine}
              </p>
            ) : null}
          </div>
        )}

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* ── CTA ── */}
        <div style={{ flexShrink: 0, marginBottom: '4%' }}>
          <div style={{
            background: ctaBg, color: ctaText,
            borderRadius: '11px', padding: '3.5% 5%',
            textAlign: 'center',
            lineHeight: '1.5',
            boxShadow: isLight
              ? `0 5px 20px rgba(0,0,0,0.20), 0 0 0 1px ${accent}44`
              : '0 5px 20px rgba(0,0,0,0.32)',
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute', inset: 0, borderRadius: '11px',
              background: 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 50%)',
            }} />
            <div style={{ position: 'relative' }}>
              <div style={{
                fontSize: 'clamp(8px, 2.4vw, 11px)',
                fontWeight: '800',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                marginBottom: '2px',
              }}>
                ✨ Real ingredients. Handmade with love.
              </div>
              <div style={{
                fontSize: 'clamp(8px, 2.3vw, 11px)',
                fontWeight: '700',
                letterSpacing: '0.03em',
              }}>
                🌿 zeshto.com &nbsp;|&nbsp; Follow @zeshto
              </div>
            </div>
          </div>
          {post.content.disclaimer ? (
            <p style={{
              textAlign: 'center',
              fontSize: 'clamp(5px, 1.4vw, 7px)',
              color: textTertiary, margin: '4px 0 0 0', lineHeight: '1.3',
            }}>
              {post.content.disclaimer}
            </p>
          ) : null}
        </div>

        {/* ── FOLLOW BAR — part of flex, always at bottom ── */}
        <div style={{
          flexShrink: 0,
          margin: '0 -7%',
          padding: '2.5% 7%',
          background: isLight ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.38)',
          borderTop: `1px solid ${isLight ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.07)'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <span style={{
            fontSize: 'clamp(6px, 1.7vw, 8px)', fontWeight: '700',
            color: accent, letterSpacing: '0.04em', textTransform: 'uppercase',
          }}>
            📸 @zeshtonaturalsoap
          </span>
          <span style={{
            fontSize: 'clamp(6px, 1.7vw, 8px)', fontWeight: '700',
            color: isLight ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.65)',
            letterSpacing: '0.04em',
          }}>
            🌐 www.zeshto.com
          </span>
        </div>
      </div>
    </div>
  );
});

export default PostCanvas;
