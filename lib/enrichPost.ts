import type { Post } from './types';
import productImages from '@/data/product-images.json';
import pkb from '@/data/pkb.json';
import { DEFAULT_DISCLAIMER } from './claimsFilter';

type ShopifyEntry = { imageUrl: string; handle: string; shopifyId: string; priceINR: number };
const images = productImages as Record<string, ShopifyEntry>;

/**
 * Enriches a stored post with live Shopify image data and (if not user-edited)
 * rebuilds the captions to include the longer format with all content blocks
 * and a product price/link footer.
 */
export function enrichPost(post: Post): Post {
  const shopify = images[post.productId];
  if (!shopify) return post;

  // Look up hero ingredients for the ingredient line
  const pkbProduct = (pkb as any[]).find((p: any) => p.id === post.productId);
  const heroIngredients: string[] = pkbProduct?.heroIngredients?.slice(0, 3) ?? [];
  const ingredientLine = heroIngredients.join(' · ');
  const shopLink = `https://zeshto.com/products/${shopify.handle}`;

  const enriched: Post = {
    ...post,
    productImageUrl: post.productImageUrl ?? shopify.imageUrl,
    productPriceINR: post.productPriceINR ?? shopify.priceINR,
    shopifyHandle: post.shopifyHandle ?? shopify.handle,
  };

  // Only rebuild captions if the post hasn't been manually edited
  // (isEdited means the user touched it — preserve their version)
  if (!post.isEdited && post.content) {
    const { hookText, relateText, insightText, solutionText, transformationText, ctaText } = post.content;

    // Detect old short-format captions (old format was 4 parts, new is 7)
    const isOldFormat = !post.instagram.caption.includes(insightText ?? '');

    if (isOldFormat) {
      const priceFooter = `🌿 ${post.productName} by Zeshto\n✨ Key ingredients: ${ingredientLine}\n🛒 Shop: ${shopLink}`;

      enriched.instagram = {
        ...enriched.instagram,
        caption: [hookText, relateText, transformationText, insightText, solutionText, priceFooter, ctaText]
          .filter(Boolean)
          .join('\n\n'),
      };

      const linkedinFooter = `About ${post.productName} by Zeshto:\n• Key ingredients: ${ingredientLine}\n• Shop: ${shopLink}`;

      enriched.linkedin = {
        ...enriched.linkedin,
        caption: [hookText, relateText, transformationText, insightText, solutionText, linkedinFooter, ctaText, `—\n${DEFAULT_DISCLAIMER}`]
          .filter(Boolean)
          .join('\n\n'),
      };
    }
  }

  return enriched;
}
