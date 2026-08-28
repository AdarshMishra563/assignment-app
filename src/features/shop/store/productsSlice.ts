import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiClient } from '../../../api/client';
import { Product } from '../types';

interface ProductsState {
  products: Product[];
  totalProducts: number;
  productsPage: number;
  hasMoreProducts: boolean;
  loadingProducts: boolean;

  selectedProduct: Product | null;
  loadingProductDetail: boolean;

  selectedCategory: string;
  selectedDoshaFilter: string | null;
  searchQuery: string;
  sortBy: 'popular' | 'price_low' | 'price_high' | 'rating';
}

const initialState: ProductsState = {
  products: [],
  totalProducts: 0,
  productsPage: 1,
  hasMoreProducts: true,
  loadingProducts: false,

  selectedProduct: null,
  loadingProductDetail: false,

  selectedCategory: 'All Remedies',
  selectedDoshaFilter: null,
  searchQuery: '',
  sortBy: 'popular',
};

export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (
    params: {
      page?: number;
      category?: string;
      dosha?: string | null;
      search?: string;
      sortBy?: 'popular' | 'price_low' | 'price_high' | 'rating';
      refresh?: boolean;
    },
    { rejectWithValue }
  ) => {
    try {
      const page = params.page || 1;
      const { data } = await apiClient.get<{
        items: Product[];
        total: number;
        page: number;
        hasMore: boolean;
      }>('/products', {
        params: {
          page,
          limit: 20,
          category: params.category,
          dosha: params.dosha,
          search: params.search,
          sortBy: params.sortBy,
        },
      });
      return { ...data, refresh: params.refresh };
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to fetch remedies');
    }
  }
);

export const fetchProductById = createAsyncThunk(
  'products/fetchProductById',
  async (productId: string, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.get<Product>(`/products/${productId}`);
      return data;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to fetch remedy details');
    }
  }
);

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setCategory(state, action: PayloadAction<string>) {
      state.selectedCategory = action.payload;
    },
    setDoshaFilter(state, action: PayloadAction<string | null>) {
      state.selectedDoshaFilter = action.payload;
    },
    setSearchQuery(state, action: PayloadAction<string>) {
      state.searchQuery = action.payload;
    },
    setSortBy(state, action: PayloadAction<'popular' | 'price_low' | 'price_high' | 'rating'>) {
      state.sortBy = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state, action) => {
        state.loadingProducts = true;
        if (action.meta.arg.refresh) {
          state.products = [];
        }
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loadingProducts = false;
        if (action.payload.refresh || action.payload.page === 1) {
          state.products = action.payload.items;
        } else {
          state.products = [...state.products, ...action.payload.items];
        }
        state.productsPage = action.payload.page;
        state.totalProducts = action.payload.total;
        state.hasMoreProducts = action.payload.hasMore;
      })
      .addCase(fetchProducts.rejected, (state) => {
        state.loadingProducts = false;
      });

    builder
      .addCase(fetchProductById.pending, (state) => {
        state.loadingProductDetail = true;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.loadingProductDetail = false;
        state.selectedProduct = action.payload;
      })
      .addCase(fetchProductById.rejected, (state) => {
        state.loadingProductDetail = false;
      });
  },
});

export const { setCategory, setDoshaFilter, setSearchQuery, setSortBy } = productsSlice.actions;
export default productsSlice.reducer;
