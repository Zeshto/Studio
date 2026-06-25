import pkbData from '../data/pkb.json';
import type { Product } from './types';

const products: Product[] = pkbData as Product[];

export function getAllProducts(): Product[] {
  return products.filter(p => p.isActive);
}

export function getProductById(id: string): Product | undefined {
  return products.find(p => p.id === id);
}

export function getProductByIndex(index: number): Product {
  const active = getAllProducts();
  return active[index % active.length];
}

export function getProductCount(): number {
  return getAllProducts().length;
}
