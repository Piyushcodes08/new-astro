// context/ArticlesContext.js
import React, { createContext, useContext, useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";

// Util to convert title to URL slug
const slugify = (text) =>
  text?.toLowerCase().replace(/[^\w ]+/g, "").replace(/ +/g, "-");

const ArticlesContext = createContext();

export const ArticlesProvider = ({ children }) => {
  const [slugMap, setSlugMap] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const snapshot = await getDocs(collection(db, "Articles"));
        const map = {};
        snapshot.forEach((doc) => {
          const data = doc.data();
          const slug = slugify(data.title);
          map[slug] = { id: doc.id, slug, ...data };
        });

        setSlugMap(map);
      } catch (error) {
        console.error("Error loading articles:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  return (
    <ArticlesContext.Provider value={{ slugMap, loading }}>
      {children}
    </ArticlesContext.Provider>
  );
};

export const useArticles = () => useContext(ArticlesContext);
