import { Product, OrderItem } from '../models/types';

export interface CartItem {
  product: Product;
  quantity: number;
}

const CART_STORAGE_KEY = 'period_love_cart';

function loadCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveCart(items: CartItem[]): void {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch {
    // ignore
  }
}

export const cartService = {
  getItems(): CartItem[] {
    return loadCart();
  },

  addItem(product: Product, quantity: number = 1): CartItem[] {
    const items = loadCart();
    const existingIndex = items.findIndex(i => i.product.id === product.id);

    if (existingIndex !== -1) {
      items[existingIndex].quantity += quantity;
    } else {
      items.push({ product, quantity });
    }

    saveCart(items);
    return items;
  },

  updateQuantity(productId: string, quantity: number): CartItem[] {
    let items = loadCart();
    if (quantity <= 0) {
      items = items.filter(i => i.product.id !== productId);
    } else {
      const target = items.find(i => i.product.id === productId);
      if (target) {
        target.quantity = quantity;
      }
    }
    saveCart(items);
    return items;
  },

  removeItem(productId: string): CartItem[] {
    const items = loadCart().filter(i => i.product.id !== productId);
    saveCart(items);
    return items;
  },

  clearCart(): void {
    localStorage.removeItem(CART_STORAGE_KEY);
  },

  calculateTotals(items: CartItem[]): {
    subtotalInr: number;
    deliveryFeeInr: number;
    totalInr: number;
    itemCount: number;
    hasPharmacistItem: boolean;
  } {
    const subtotalInr = items.reduce((sum, item) => sum + item.product.priceInr * item.quantity, 0);
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    // Free delivery over ₹500, else ₹49
    const deliveryFeeInr = subtotalInr > 500 || subtotalInr === 0 ? 0 : 49;
    const totalInr = subtotalInr + deliveryFeeInr;
    const hasPharmacistItem = items.some(item => item.product.requiresPharmacistGuidance);

    return {
      subtotalInr,
      deliveryFeeInr,
      totalInr,
      itemCount,
      hasPharmacistItem,
    };
  },

  toOrderItems(items: CartItem[]): OrderItem[] {
    return items.map(item => ({
      productId: item.product.id,
      productName: item.product.name,
      quantity: item.quantity,
      unitPriceInr: item.product.priceInr,
    }));
  },
};
