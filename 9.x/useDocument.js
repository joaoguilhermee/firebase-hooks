import { useEffect, useState } from 'react';
import db from '../../services/firestore';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';

export const useDocument = (path, id, realtime = false) => {
  const [document, setDocument] = useState(null);
  const [error, setError] = useState(null);

  const snapshotToDocument = (snapshot) => {
    setDocument({
      ...snapshot.data(),
      id: snapshot.id,
    });
    setError(null);
  };
  const handleError = (error) => {
    console.log('useDocument-error', error);
    setError(error);
  };
  useEffect(() => {
    const ref = doc(db, path, id);
    if (realtime) {
      const unsubscribe = onSnapshot(
        ref,
        (snapshot) => {
          snapshotToDocument(snapshot);
          return unsubscribe;
        },
        handleError
      );
      return () => unsubscribe();
    } else {
      getDoc(ref).then((snapshot) => {
        snapshotToDocument(snapshot);
      }, handleError);
    }
  }, [path, id, realtime]);

  return {
    document,
    error,
  };
};
