import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

export interface Toy {
  _id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  image: string;
  stock: number;
  ageRange: string;
  oldPrice?: number;
  discount?: number;
  rating?: number;
  badge?: string;
}
interface ProductState {
  toys: Toy[];
  loading: boolean;
  error: string | null;
}

const initialState: ProductState = {
  toys: [],
  loading: false,
  error: null,
};

export const fetchProducts = createAsyncThunk(
  "products/fetchProducts",
  async (ageRange?: string) => {
    const url = ageRange
      ? `http://localhost:5000/api/products?ageRange=${encodeURIComponent(ageRange)}`
      : "http://localhost:5000/api/products";

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Failed to fetch products");
    }

    const result = await response.json();
    return result.data as Toy[];
  }
);

const productSlice = createSlice({
  name: "products",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.toys = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Something went wrong";
      });
  },
});

export default productSlice.reducer;
