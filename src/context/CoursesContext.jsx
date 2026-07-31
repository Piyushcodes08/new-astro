import React, { createContext, useContext, useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { createLogger } from "../utils/logger";

const logger = createLogger('CoursesContext');

const CoursesContext = createContext();
let cachedSlugMap = null;
let pendingCoursesRequest = null;

const slugify = (text) =>
  text?.toLowerCase().replace(/[^\w ]+/g, "").replace(/ +/g, "-");

const loadCourses = async () => {
  if (cachedSlugMap) return cachedSlugMap;
  if (pendingCoursesRequest) return pendingCoursesRequest;

  pendingCoursesRequest = (async () => {
    const [freeSnap, paidSnap] = await Promise.all([
      getDocs(collection(db, "freeCourses")),
      getDocs(collection(db, "paidCourses")),
    ]);

    const map = {};

    freeSnap.forEach((doc) => {
      const data = doc.data();
      const slug = slugify(data.title);
      map[`free/${slug}`] = { id: doc.id, type: "free", slug, ...data };
    });

    paidSnap.forEach((doc) => {
      const data = doc.data();
      const slug = slugify(data.title);
      map[`paid/${slug}`] = { id: doc.id, type: "paid", slug, ...data };
    });

    cachedSlugMap = map;
    return map;
  })().finally(() => {
    pendingCoursesRequest = null;
  });

  return pendingCoursesRequest;
};

export const CoursesProvider = ({ children }) => {
  const [slugMap, setSlugMap] = useState(cachedSlugMap || {});
  const [loading, setLoading] = useState(!cachedSlugMap);

  useEffect(() => {
    let active = true;
    let timeoutId = null;
    let idleCallbackId = null;

    const load = async () => {
      try {
        const map = await loadCourses();
        if (active) setSlugMap(map);
      } catch (error) {
        logger.error("Error loading courses:", error);
      } finally {
        if (active) setLoading(false);
      }
    };

    if (typeof requestIdleCallback === 'function') {
      idleCallbackId = requestIdleCallback(load, { timeout: 2500 });
    } else {
      timeoutId = window.setTimeout(load, 2500);
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
    <CoursesContext.Provider value={{ slugMap, loading }}>
      {children}
    </CoursesContext.Provider>
  );
};

export const useCourses = () => {
  const context = useContext(CoursesContext);
  if (!context) {
    throw new Error("useCourses must be used within a CoursesProvider");
  }
  return context;
};
