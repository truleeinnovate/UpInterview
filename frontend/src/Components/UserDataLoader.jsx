import React from 'react';
import { useSingleContact } from '../apiHooks/useUsers';
import Loading from './Loading';
import AuthCookieManager from '../utils/AuthCookieManager/AuthCookieManager';

const UserDataLoader = ({ children }) => {
  const currentUser = AuthCookieManager.getCurrentUserId();
  const { isLoading, isError } = useSingleContact();

  // If no user is logged in, render children immediately
  if (!currentUser) {
    return children;
  }

  // If data is loading, show loading screen
  if (isLoading) {
    return (
      <Loading 
        message="Loading your profile..." 
        size="large"
        className="fixed inset-0 z-50 bg-white"
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