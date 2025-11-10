import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../apiClient";
import { toast } from "react-toastify";

// Async Thunks
export const fetchCategories = createAsyncThunk(
  "categories/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await apiClient.get("api/categories");
      return res.data;
    } catch (err) {
      toast.error("Failed to fetch categories");
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const addCategory = createAsyncThunk(
  "categories/add",
  async (categoryData, { rejectWithValue }) => {
    try {
      const res = await apiClient.post("api/categories", categoryData);
      toast.success("Category added successfully");
      return res.data;
    } catch (err) {
      const errorMessage =
        err.response?.data?.errors?.name?.[0] || "Failed to add category";
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

export const updateCategory = createAsyncThunk(
  "categories/update",
  async ({ id, ...categoryData }, { rejectWithValue }) => {
    try {
      const res = await apiClient.put(`api/categories/${id}`, categoryData);
      toast.success("Category updated successfully");
      return res.data;
    } catch (err) {
      toast.error("Failed to update category");
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const deleteCategory = createAsyncThunk(
  "categories/delete",
  async (id, { rejectWithValue }) => {
    try {
      await apiClient.delete(`api/categories/${id}`);
      toast.success("Category deleted successfully");
      return id;
    } catch (err) {
      toast.error("Failed to delete category");
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// Slice
const categoriesSlice = createSlice({
  name: "categories",
  initialState: {
    items: [],
    loading: false,
    error: null,
    actionLoading: false,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    // ✅ New reducer to set categories directly
    setCategories: (state, action) => {
      state.items = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Categories
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Add Category
      .addCase(addCategory.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(addCategory.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.items.push(action.payload);
      })
      .addCase(addCategory.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })
      // Update Category
      .addCase(updateCategory.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(updateCategory.fulfilled, (state, action) => {
        state.actionLoading = false;
        const index = state.items.findIndex(
          (cat) => cat.id === action.payload.id
        );
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(updateCategory.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })
      // Delete Category
      .addCase(deleteCategory.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.items = state.items.filter((cat) => cat.id !== action.payload);
      })
      .addCase(deleteCategory.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      });
  },
});

// Export actions
export const { clearError, setCategories } = categoriesSlice.actions;
export default categoriesSlice.reducer;
