export interface Product {
  id: string;
  name: string;
  slug: string;
  heroIngredients: string[];
  fullIngredientList: string[];
  skinConcerns: string[];
  targetSkinType: string[];
  priceINR: number;
  positioningLine: string;
  safeBenefitClaims: string[];
  category: 'face' | 'body' | 'hair';
  emotionalHook: string;
  ingredientStory: string;
  isActive: boolean;
}

export type EmotionType = 'fear' | 'frustration' | 'hope' | 'desire' | 'educational';
export type Platform = 'instagram' | 'linkedin' | 'youtube';

export interface PostContent {
  hookText: string;
  relateText: string;
  insightText: string;
  solutionText: string;
  transformationText: string;
  ctaText: string;
  disclaimer: string;
}

export interface PlatformCaption {
  caption: string;
  hashtags: string[];
}

export interface YoutubeContent {
  script: string;
  title: string;
  description: string;
  tags: string[];
}

export interface Post {
  id: string;
  dayNumber: number;
  title: string;
  productId: string;
  productName: string;
  productImageUrl?: string;
  productPriceINR?: number;
  shopifyHandle?: string;
  emotionType: EmotionType;
  content: PostContent;
  instagram: PlatformCaption;
  linkedin: PlatformCaption;
  youtube: YoutubeContent;
  backgroundIndex: number;
  logoUrl?: string;
  isEdited: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Settings {
  ownerEmail: string;
  logoUrl: string;
  disclaimer: string;
  bannedPhrases: string[];
}

export interface ClaimsCheckResult {
  isSafe: boolean;
  violations: string[];
  sanitized: string;
}
