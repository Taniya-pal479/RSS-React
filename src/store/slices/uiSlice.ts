import { createSlice,type PayloadAction } from '@reduxjs/toolkit';

interface UiState {
 
  currentLanguage: string;  
  isSidebarOpen: boolean;
  searchQuery: string;
}

const initialState: UiState = {
  currentLanguage: 'hi', // Default to English so UI isn't empty
  isSidebarOpen: true,
  searchQuery: '',
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
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
  },
});

export const { setLanguage, toggleSidebar, openSidebar,setSearchQuery } = uiSlice.actions;
export default uiSlice.reducer;