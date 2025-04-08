import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  isLoggedIn: boolean;
}

const initialState: AuthState = {
  accessToken: localStorage.getItem('accessToken'),
  refreshToken: localStorage.getItem('refreshToken'),
  isLoggedIn: !!localStorage.getItem('accessToken'),
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ accessToken: string; refreshToken: string }>
    ) => {
      const { accessToken, refreshToken } = action.payload;
      state.accessToken = accessToken;
      state.refreshToken = refreshToken;
      state.isLoggedIn = true;
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
    },
    clearCredentials: state => {
      state.accessToken = null;
      state.refreshToken = null;
      state.isLoggedIn = false;
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    },
  },
});

export const { setCredentials, clearCredentials } = authSlice.actions;
export default authSlice.reducer;
