import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { RootState } from '../store';

export const useAuth = () => {
  const { isLoggedIn, accessToken } = useSelector((state: RootState) => state.auth);
  const { pathname } = useLocation();

  const isAuthPage = ['/login', '/forgot-password', '/set-password'].includes(pathname);
  const shouldShowLayout = isLoggedIn && !isAuthPage;

  return {
    isAuthenticated: isLoggedIn,
    accessToken,
    shouldShowLayout,
  };
};
