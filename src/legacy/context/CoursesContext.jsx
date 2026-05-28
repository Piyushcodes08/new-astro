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

      // Fetch from both freeCourses and paidCourses
      const courseTypes = ["freeCourses", "paidCourses"];

      for (const type of courseTypes) {
        const snapshot = await getDocs(collection(db, type));
        snapshot.forEach((doc) => {
          const data = doc.data();
          const slug = slugify(data.title);
          map[`${type === "freeCourses" ? "free" : "paid"}/${slug}`] = {
            id: doc.id,
            type: type === "freeCourses" ? "free" : "paid",
            slug,
            ...data,
          };
        });
      }

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
