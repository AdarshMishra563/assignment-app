import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { IPost } from '../../types';
import { apiClient } from '../../api/client';

interface PostState {
  posts: IPost[];
  loading: boolean;
  error: string | null;
}

const initialState: PostState = {
  posts: [],
  loading: false,
  error: null
};

export const fetchPosts = createAsyncThunk('post/fetchPosts', async (_, { rejectWithValue }) => {
  try {
    const res = await apiClient.get('/posts');
    return res.data.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.error || 'Failed to fetch posts');
  }
});

export const toggleLikePostAsync = createAsyncThunk(
  'post/toggleLikePostAsync',
  async (postId: string, { rejectWithValue }) => {
    try {
      const res = await apiClient.post(`/posts/${postId}/like`);
      return res.data.data; // updated post object
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error || 'Failed to like post');
    }
  }
);

const postSlice = createSlice({
  name: 'post',
  initialState,
  reducers: {
    addPost: (state, action: PayloadAction<IPost>) => {
      state.posts.unshift(action.payload);
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPosts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPosts.fulfilled, (state, action: PayloadAction<IPost[]>) => {
        state.loading = false;
        state.posts = action.payload;
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(toggleLikePostAsync.fulfilled, (state, action: PayloadAction<IPost>) => {
        const index = state.posts.findIndex((p) => p.id === action.payload.id);
        if (index !== -1) {
          state.posts[index] = action.payload;
        }
      });
  }
});

export const { addPost } = postSlice.actions;
export default postSlice.reducer;
