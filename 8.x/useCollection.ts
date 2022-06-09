import { useEffect, useState, useRef } from 'react';
import db from 'services/firestore';

export const useCollection = (collection, _query, _orderBy) => {
  const [documents, setDocuments] = useState([]);
  const [error, setError] = useState(null);

  const query = useRef(_query).current;
  const orderBy = useRef(_orderBy).current;

  useEffect(() => {
    let ref = db.collection(collection) as any;
    if (query) {
      const [field, filter, value] = query;
      ref = ref.where(field, filter, value);
    }
    if (orderBy) {
      const [field, direction] = orderBy;
      ref = ref.orderBy(field, direction);
    }

    const unsubscribe = ref.onSnapshot(
      snapshot => {
        let results = [];
        snapshot.docs.forEach(doc => {
          results.push({
            ...doc.data(),
            id: doc.id,
          });
        });

        setDocuments(results);
        setError(null);
      },
      error => {
        console.log('useCollectionError', error);
        setError(error);
      },
    );

    return () => unsubscribe();
  }, [collection, query, orderBy]);

  return {
    documents,
    error,
  };
};
