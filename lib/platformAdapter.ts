import type { Post, Platform } from './types';

export interface PlatformOutput {
  caption: string;
  hashtags: string[];
  hashtagString: string;
  dimensions: { width: number; height: number; label: string };
  aspectRatio: string;
}

export function getPlatformOutput(post: Post, platform: Platform): PlatformOutput {
  switch (platform) {
    case 'instagram':
      return {
        caption: post.instagram.caption,
        hashtags: post.instagram.hashtags,
        hashtagString: post.instagram.hashtags.join(' '),
        dimensions: { width: 1080, height: 1920, label: '1080×1920 (Reel)' },
        aspectRatio: '9/16',
      };
    case 'linkedin':
      return {
        caption: post.linkedin.caption,
        hashtags: post.linkedin.hashtags,
        hashtagString: post.linkedin.hashtags.join(' '),
        dimensions: { width: 1080, height: 1350, label: '1080×1350 (LinkedIn)' },
        aspectRatio: '4/5',
      };
    case 'youtube':
      return {
        caption: post.youtube.script,
        hashtags: post.youtube.tags.slice(0, 5).map(t => `#${t.replace(/\s+/g, '')}`),
        hashtagString: post.youtube.tags.map(t => `#${t.replace(/\s+/g, '')}`).join(' '),
        dimensions: { width: 1080, height: 1920, label: '1080×1920 (Short)' },
        aspectRatio: '9/16',
      };
  }
}

export function getPlatformLabel(platform: Platform): string {
  return { instagram: 'Instagram Reel', linkedin: 'LinkedIn Post', youtube: 'YouTube Short' }[platform];
}
