import React from 'react';
import { useLocation } from 'react-router-dom';
import { useSingleContact } from '../apiHooks/useUsers';
import Loading from './Loading';
import AuthCookieManager from '../utils/AuthCookieManager/AuthCookieManager';

const UserDataLoader = ({ children }) => {
  const location = useLocation();
  const currentUser = AuthCookieManager.getCurrentUserId();
  const { isLoading, isError } = useSingleContact();

  // Define public routes where we don't want to show loading screen
  const publicRoutes = [
    '/',
    '/select-user-type',
    '/select-profession',
    '/complete-profile',
    '/subscription-plans',
    '/organization-signup',
    '/organization-login',
    '/callback',
    '/payment-details',
    '/subscription-payment-details',
    '/verify-email',
    '/verify-user-email',
    '/subscription-success',
    '/resetPassword',
    '/forgetPassword',
    '/assessmenttest',
    '/assessmenttext',
    '/assessmentsubmit',
    '/candidatevc',
    '/jitsimeetingstart',
    '/organization',
    '/price'
  ];

  const isPublicRoute = publicRoutes.includes(location.pathname);

  // If no user is logged in, render children immediately
  if (!currentUser) {
    return children;
  }

  // If it's a public route, render children immediately without showing loading
  if (isPublicRoute) {
    return children;
  }

  // If data is loading, show loading screen (only for protected routes)
  if (isLoading) {
    return (
      <Loading 
        message="Loading..." 
        // size="large"
        // className="fixed inset-0 z-50 bg-white"
      />
    );
  }

  // If there's an error loading user data, still render children but log the error
  if (isError) {
    console.error('Failed to load user data');
    return children;
  }

  // If data is loaded successfully, render children
  return children;
};

export default UserDataLoader; 