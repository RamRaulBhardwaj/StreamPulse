import { createContext, useReducer, useEffect } from 'react';
import { authReducer, authInitialState, AUTH_ACTIONS } from './authReducer.js';
import { authService } from '../services/authService.js';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, authInitialState);

  // Initialize authentication from localStorage on first render
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          dispatch({
            type: AUTH_ACTIONS.LOGIN_SUCCESS,
            payload: { token: storedToken, user: parsedUser }
          });
        } catch {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          dispatch({ type: AUTH_ACTIONS.LOGOUT });
        }
      } else {
        dispatch({ type: AUTH_ACTIONS.LOGOUT });
      }
    };

    initializeAuth();
  }, []);

  // Login handler
  const login = async (email, password) => {
    dispatch({ type: AUTH_ACTIONS.SET_LOADING });
    try {
      const response = await authService.login({ email, password });
      const { user, token } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: { user, token }
      });
      return { success: true };
    } catch (err) {
      dispatch({
        type: AUTH_ACTIONS.AUTH_ERROR,
        payload: err.message
      });
      return { success: false, error: err.message, errors: err.errors || [] };
    }
  };

  // Register handler
  const register = async (userData) => {
    dispatch({ type: AUTH_ACTIONS.SET_LOADING });
    try {
      const response = await authService.register(userData);
      const { user, token } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      dispatch({
        type: AUTH_ACTIONS.REGISTER_SUCCESS,
        payload: { user, token }
      });
      return { success: true };
    } catch (err) {
      dispatch({
        type: AUTH_ACTIONS.AUTH_ERROR,
        payload: err.message
      });
      return { success: false, error: err.message, errors: err.errors || [] };
    }
  };

  // Logout handler
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    dispatch({ type: AUTH_ACTIONS.LOGOUT });
  };

  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  };

  // Follow / Unfollow client-side sync handler
  const updateFollowing = (creator, isFollowing) => {
    if (!state.user) return;
    const currentFollowing = state.user.following || [];
    const creatorId = (creator._id || creator.id || creator).toString();

    let newFollowing;
    if (isFollowing) {
      const alreadyFollowing = currentFollowing.some(
        (f) => (f._id || f.id || f).toString() === creatorId
      );
      if (!alreadyFollowing) {
        const creatorObj =
          typeof creator === 'object'
            ? {
                _id: creatorId,
                name: creator.name,
                avatar: creator.avatar,
                category: creator.category,
                role: creator.role
              }
            : { _id: creatorId };
        newFollowing = [...currentFollowing, creatorObj];
      } else {
        newFollowing = currentFollowing;
      }
    } else {
      newFollowing = currentFollowing.filter(
        (f) => (f._id || f.id || f).toString() !== creatorId
      );
    }

    const updatedUser = {
      ...state.user,
      following: newFollowing
    };

    localStorage.setItem('user', JSON.stringify(updatedUser));
    dispatch({
      type: AUTH_ACTIONS.UPDATE_USER,
      payload: updatedUser
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        loading: state.loading,
        error: state.error,
        login,
        register,
        logout,
        clearError,
        updateFollowing
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
