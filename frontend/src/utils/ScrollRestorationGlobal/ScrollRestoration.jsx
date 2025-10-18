// Added by Ashok
// v1.0.0 - Ashok - Improved the scroll to top at global
// v1.0.1 - Ashok - Improved the scroll also for step page changes
/**
 * ScrollRestoration Component
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
 *
 * ScrollRestoration
 * Props:
 *  - trigger: any value (state/prop) that should also scroll the page when it changes
 */
// v1.0.0 <------------------------------------------
import { useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollRestoration = ({ trigger }) => {
  const { pathname } = useLocation();

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname, trigger]);

  return null;
};

export default ScrollRestoration;
// v1.0.0 ------------------------------------------>
