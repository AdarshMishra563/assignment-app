import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Product } from '../types';
import { showToast } from '../../../design-system/components/Toast';

interface WishlistState {
  items: Product[];
}

const initialState: WishlistState = {
  items: [],
};

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    toggleWishlist(state, action: PayloadAction<Product>) {
      const exists = state.items.some((p) => p.id === action.payload.id);
      if (exists) {
        state.items = state.items.filter((p) => p.id !== action.payload.id);
        showToast.info('Removed from saved remedies');
      } else {
        state.items.push(action.payload);
        showToast.success('Saved to your remedies');
      }
    },
    removeFromWishlist(state, action: PayloadAction<string>) {
      state.items = state.items.filter((p) => p.id !== action.payload);
    },
  },
});

export const { toggleWishlist, removeFromWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;
