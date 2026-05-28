import React, { createContext, useContext, useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";

// Create context
const CoursesContext = createContext();

const slugify = (text) =>
  text?.toLowerCase().replace(/[^\w ]+/g, "").replace(/ +/g, "-");

export const CoursesProvider = ({ children }) => {
  const [slugMap, setSlugMap] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      const map = {};

      // ✅ FIX: Fetch both collections in PARALLEL — ~50% faster than sequential for loop
      const [freeSnap, paidSnap] = await Promise.all([
        getDocs(collection(db, "freeCourses")),
        getDocs(collection(db, "paidCourses")),
      ]);

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

      setSlugMap(map);
      setLoading(false);
    };

    fetchCourses();
  }, []);

  return (
    <CoursesContext.Provider value={{ slugMap, loading }}>
      {children}
    </CoursesContext.Provider>
  );
};

export const useCourses = () => useContext(CoursesContext);
