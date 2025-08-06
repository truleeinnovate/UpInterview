// Added by Ashok 
/**
 * ScrollToTop Component
 *
 * Purpose:
 * This component automatically scrolls the window to the top of the page
 * whenever the route (pathname) changes in a React Router-based app.
 *
 * Why Use:
 * In Single Page Applications (SPAs), navigating to a new route does not
 * automatically scroll the page to the top. This can lead to a confusing user
 * experience, especially when the previous page was scrolled down.
 *
 * How It Works:
 * - Listens to changes in the current location (pathname) using useLocation()
 * - On every pathname change, runs window.scrollTo({ top: 0 }) to scroll to top
 *
 * Usage:
 * Place this component just inside <BrowserRouter> and outside <Routes> in App.jsx
 */

import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pathname]);

  return null;
};

export default ScrollToTop;
