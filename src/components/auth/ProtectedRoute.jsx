import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { createLogger } from "../../utils/logger";

const logger = createLogger('ProtectedRoute');

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  useEffect(() => {
    let active = true;
    let unsubscribe = null;

    const checkAuthorization = async () => {
      setLoading(true);

      try {
        const [{ db }, authModule, firestoreModule] = await Promise.all([
          import('../../firebaseConfig'),
          import('firebase/auth'),
          import('firebase/firestore'),
        ]);

        const { getAuth, onAuthStateChanged } = authModule;
        const { collection, query, where, getDocs } = firestoreModule;
        const auth = getAuth();

        const verifyUser = async (user) => {
          if (!active) return;

          if (adminOnly) {
            try {
              const usersRef = collection(db, "users");
              const q = query(usersRef, where("email", "==", user.email));
              const querySnapshot = await getDocs(q);

              if (!querySnapshot.empty) {
                const userData = querySnapshot.docs[0].data();
                setIsAuthorized(Boolean(userData.isAdmin));
              } else {
                setIsAuthorized(false);
              }
            } catch (error) {
              logger.error("Error verifying admin status:", error);
              setIsAuthorized(false);
            }
          } else {
            setIsAuthorized(true);
          }

          setLoading(false);
        };

        const user = auth.currentUser;

        if (!user) {
          unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (!active) return;
            if (!currentUser) {
              setLoading(false);
              return;
            }
            await verifyUser(currentUser);
          });
        } else {
          await verifyUser(user);
        }
      } catch (error) {
        logger.error("ProtectedRoute auth initialization failed:", error);
        if (active) {
          setIsAuthorized(false);
          setLoading(false);
        }
      }
    };

    checkAuthorization();

    return () => {
      active = false;
      if (unsubscribe) unsubscribe();
    };
  }, [adminOnly]);

  if (loading) {
    return <div className="text-center text-white min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!isAuthorized) {
    return <Navigate to="/login" state={{ from: location }} />;
  }

  return children;
};

export default ProtectedRoute;
