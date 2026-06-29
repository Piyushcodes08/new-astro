import { useState, useEffect } from 'react';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { createLogger } from '../utils/logger';

const logger = createLogger('useProducts');

export const useProducts = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
            const querySnapshot = await getDocs(q);
            const fetchedProducts = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setProducts(fetchedProducts);
            setError(null);
        } catch (err) {
            logger.error("Error fetching products:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    return { products, loading, error, refetch: fetchProducts };
};
