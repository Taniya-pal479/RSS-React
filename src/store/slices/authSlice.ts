import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  
  accessToken: string | null; // Match the API key name
  type: string | null;        // Match the API key name
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  // Use 'accessToken' consistently everywhere
  accessToken: localStorage.getItem('accessToken'),
  type: localStorage.getItem('userType'),
  isAuthenticated: !!localStorage.getItem('accessToken'),
  
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // action.payload will now be { accessToken: string, type: string }
    setCredentials: (
      state,
      action: PayloadAction<{ accessToken: string; type: string }>
    ) => {
      const { accessToken, type } = action.payload;
      state.accessToken = accessToken;
      state.type = type;
      state.isAuthenticated = true;

      // Persist using the correct key names
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('userType', type);
    },

    logout: (state) => {
      state.accessToken = null;
      state.type = null;
      state.isAuthenticated = false;

      localStorage.removeItem('accessToken');
      localStorage.removeItem('userType');
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;