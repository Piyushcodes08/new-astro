import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { getAnalyticsInstance } from "../../firebaseConfig";

const AnalyticsTracker = () => {
  const location = useLocation();

  useEffect(() => {
    let canceled = false;

    getAnalyticsInstance()
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
        // Analytics is non-critical
      });

    return () => {
      canceled = true;
    };
  }, [location]);

  return null;
};



export default AnalyticsTracker;

