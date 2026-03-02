import React, { createContext, useContext, useState } from 'react';

const BannerContext = createContext();

export const BannerProvider = ({ children }) => {
  const [bannerConfig, setBannerConfig] = useState(null);

  const showBanner = (config) => {
    setBannerConfig(config);
  };

  const hideBanner = () => setBannerConfig(null);

  return (
    <BannerContext.Provider value={{ bannerConfig, showBanner, hideBanner }}>
      {children}
    </BannerContext.Provider>
  );
};

export const useBanner = () => useContext(BannerContext);