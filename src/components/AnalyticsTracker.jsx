import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const AnalyticsTracker = () => {
  const location = useLocation();

  useEffect(() => {
    let canceled = false;

    // Dynamic import avoids static module cache issues between dev server restarts
    import("../firebaseConfig")
      .then(({ getAnalyticsInstance }) => getAnalyticsInstance())
      .then(async (analytics) => {
        if (!canceled && analytics) {
          const { logEvent } = await import('firebase/analytics');
          logEvent(analytics, "page_view", {
            page_path: location.pathname,
            page_title: document.title,
          });
        }
      })
      .catch(() => {
        // Analytics is non-critical — silently ignore all errors
      });

    return () => {
      canceled = true;
    };
  }, [location]);

  return null;
};

export default AnalyticsTracker;
