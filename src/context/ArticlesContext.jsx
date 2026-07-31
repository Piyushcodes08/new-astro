import React, { createContext, useContext, useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { createLogger } from "../utils/logger";

const logger = createLogger('ArticlesContext');

const slugify = (text) =>
  text?.toLowerCase().replace(/[^\w ]+/g, "").replace(/ +/g, "-");

const ArticlesContext = createContext();

export const ArticlesProvider = ({ children }) => {
  const [slugMap, setSlugMap] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    let timeoutId = null;
    let idleCallbackId = null;

    const fetchArticles = async () => {
      try {
        const snapshot = await getDocs(collection(db, "Articles"));
        const map = {};
        snapshot.forEach((doc) => {
          const data = doc.data();
          const slug = slugify(data.title);
          map[slug] = { id: doc.id, slug, ...data };
        });
        if (active) setSlugMap(map);
      } catch (error) {
        logger.error("Error loading articles:", error);
      } finally {
        if (active) setLoading(false);
      }
    };

    if (typeof requestIdleCallback === 'function') {
      idleCallbackId = requestIdleCallback(fetchArticles, { timeout: 2500 });
    } else {
      timeoutId = window.setTimeout(fetchArticles, 2500);
    }

    return () => {
      active = false;
      if (typeof cancelIdleCallback === 'function' && idleCallbackId != null) {
        cancelIdleCallback(idleCallbackId);
      }
      if (timeoutId != null) {
        window.clearTimeout(timeoutId);
      }
    };
  }, []);

  return (
    <ArticlesContext.Provider value={{ slugMap, loading }}>
      {children}
    </ArticlesContext.Provider>
  );
};

export const useArticles = () => {
  const ctx = useContext(ArticlesContext);
  // Return safe fallback during HMR or if used outside provider
  return ctx ?? { slugMap: {}, loading: true };
};
