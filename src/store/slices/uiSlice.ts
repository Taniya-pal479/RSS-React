import { createSlice,type PayloadAction } from '@reduxjs/toolkit';

interface UiState {
 
  currentLanguage: string; // 'en', 'hi', etc.
  isSidebarOpen: boolean;
}

const initialState: UiState = {
  currentLanguage: 'en', // Default to English so UI isn't empty
  isSidebarOpen: true,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setLanguage: (state, action: PayloadAction<string>) => {
      console.log("Language Changed to:", action.payload); // Debugging
      state.currentLanguage = action.payload;
    },
    toggleSidebar: (state) => {
      state.isSidebarOpen = !state.isSidebarOpen;
    },
    openSidebar: (state) => {
      state.isSidebarOpen = true;
    }
  },
});

export const { setLanguage, toggleSidebar, openSidebar } = uiSlice.actions;
export default uiSlice.reducer;