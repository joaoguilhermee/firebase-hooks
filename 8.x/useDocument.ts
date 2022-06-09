import { useEffect, useState } from 'react';
import db from 'services/firestore';

export const useDocument = (collection, id) => {
  const [document, setDocument] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const ref = db.collection(collection).doc(id);

    const unsubscribe = ref.onSnapshot(
      snapshot => {
        setDocument({
          ...snapshot.data(),
          id: snapshot.id,
        });
        setError(null);
      },
      error => {
        setError(error);
      },
    );

    return () => unsubscribe();
  }, [collection, id]);

  return {
    document,
    error,
  };
};
