import { Product } from '../models/types';
import { SEED_PRODUCTS } from '../data/seedData';

const PRODUCTS_KEY = 'period_love_products';

function getStoredProducts(): Product[] {
  try {
    const raw = localStorage.getItem(PRODUCTS_KEY);
    if (!raw) {
      localStorage.setItem(PRODUCTS_KEY, JSON.stringify(SEED_PRODUCTS));
      return SEED_PRODUCTS;
    }
    return JSON.parse(raw);
  } catch {
    return SEED_PRODUCTS;
  }
}

function saveStoredProducts(products: Product[]): void {
  try {
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
  } catch {
    // ignore
  }
}

export const productService = {
  getProducts(category?: string, query?: string): Product[] {
    let items = getStoredProducts();
    if (category && category !== 'all') {
      items = items.filter(p => p.category === category);
    }
    if (query && query.trim()) {
      const q = query.toLowerCase().trim();
      items = items.filter(p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
    }
    return items;
  },

  getProductById(id: string): Product | null {
    const items = getStoredProducts();
    return items.find(p => p.id === id) || null;
  },

  updateStock(id: string, newStock: number): void {
    const items = getStoredProducts();
    const idx = items.findIndex(p => p.id === id);
    if (idx !== -1) {
      items[idx].stock = Math.max(0, newStock);
      saveStoredProducts(items);
    }
  },

  createProduct(product: Omit<Product, 'id'>): Product {
    const items = getStoredProducts();
    const newProduct: Product = {
      ...product,
      id: `prod_${Date.now()}`,
    };
    items.unshift(newProduct);
    saveStoredProducts(items);
    return newProduct;
  },

  deleteProduct(id: string): void {
    const items = getStoredProducts();
    const filtered = items.filter(p => p.id !== id);
    saveStoredProducts(filtered);
  },
};
