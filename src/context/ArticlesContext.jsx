// context/ArticlesContext.js
import React, { createContext, useContext, useEffect, useState } from "react";
import { createLogger } from "../utils/logger";

const logger = createLogger('ArticlesContext');

// Util to convert title to URL slug
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
        const [{ collection, getDocs }, { db }] = await Promise.all([
          import('firebase/firestore'),
          import('../firebaseConfig'),
        ]);

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

export const useArticles = () => useContext(ArticlesContext);
