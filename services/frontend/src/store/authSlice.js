import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  organizations: []
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { token, user, organizations } = action.payload;
      state.token = token;
      state.user = user;
      state.organizations = organizations || [];
      state.isAuthenticated = true;
      localStorage.setItem('token', token);
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.organizations = [];
      localStorage.removeItem('token');
    },
    setOrganizations: (state, action) => {
      state.organizations = action.payload;
    }
  }
});

export const { setCredentials, logout, setOrganizations } = authSlice.actions;
export default authSlice.reducer;
