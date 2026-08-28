import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CartItem, Coupon, Product } from '../types';
import { showToast } from '../../../design-system/components/Toast';

interface CartState {
  items: CartItem[];
  appliedCoupon: Coupon | null;
  deliveryFee: number;
}

const initialState: CartState = {
  items: [
    {
      product: {
        id: 'prod_1',
        name: 'Amrutam Kuntal Care Hair Spa',
        subtitle: 'Nourishing botanical hair churnam & mask',
        category: 'Herbal Oils & Kuntal Care',
        price: 899,
        originalPrice: 1199,
        rating: 4.9,
        ratingCount: 1420,
        image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=600',
        images: ['https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=600'],
        description: 'Infused with Bhringraj, Triphala, and Hibiscus.',
        ingredients: ['Bhringraj', 'Amla', 'Brahmi', 'Shikakai'],
        keyBenefits: ['Strengthens hair roots', 'Cools Pitta scalp irritation'],
        recommendedForDosha: ['pitta', 'vata'],
        allergyTags: ['Herbal Extracts'],
        isBestSeller: true,
        isCertified: true,
        inStock: true,
        stockCount: 85,
        dosageInstructions: 'Massage into dry hair & scalp.',
      },
      quantity: 1,
    },
  ],
  appliedCoupon: {
    code: 'AMRUTAM10',
    discountPercentage: 10,
    maxDiscount: 200,
    minOrder: 499,
  },
  deliveryFee: 50,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart(state, action: PayloadAction<{ product: Product; quantity?: number }>) {
      const { product, quantity = 1 } = action.payload;
      const existing = state.items.find((item) => item.product.id === product.id);
      if (existing) {
        existing.quantity += quantity;
      } else {
        state.items.push({ product, quantity });
      }
      showToast.success(`Added ${product.name} to cart`);
    },
    removeFromCart(state, action: PayloadAction<string>) {
      state.items = state.items.filter((item) => item.product.id !== action.payload);
      showToast.info('Item removed from cart');
    },
    updateQuantity(state, action: PayloadAction<{ productId: string; quantity: number }>) {
      const { productId, quantity } = action.payload;
      if (quantity <= 0) {
        state.items = state.items.filter((item) => item.product.id !== productId);
      } else {
        const item = state.items.find((i) => i.product.id === productId);
        if (item) {
          item.quantity = quantity;
        }
      }
    },
    applyCoupon(state, action: PayloadAction<string>) {
      const code = action.payload.trim().toUpperCase();
      if (code === 'AMRUTAM10' || code === 'VEDIC20' || code === 'FIRSTCARE') {
        state.appliedCoupon = {
          code,
          discountPercentage: code === 'VEDIC20' ? 20 : 10,
          maxDiscount: code === 'VEDIC20' ? 350 : 200,
          minOrder: 499,
        };
        showToast.success(`Coupon ${code} applied successfully!`);
      } else {
        showToast.error('Invalid coupon code. Try AMRUTAM10 or VEDIC20');
      }
    },
    removeCoupon(state) {
      state.appliedCoupon = null;
      showToast.info('Coupon removed');
    },
    clearCart(state) {
      state.items = [];
      state.appliedCoupon = null;
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  updateQuantity,
  applyCoupon,
  removeCoupon,
  clearCart,
} = cartSlice.actions;

export default cartSlice.reducer;
