import { useEffect, useState, useRef } from 'react';
import db from '../../services/firestore';
import {
  collection,
  getDocs,
  onSnapshot,
  where,
  orderBy,
} from 'firebase/firestore';

export const useCollection = (path, realtime = false, _query, _orderBy) => {
  const [documents, setDocuments] = useState([]);
  const [error, setError] = useState(null);

  const query = useRef(_query).current;
  const oBy = useRef(_orderBy).current;

  const snapshotToDocument = (snapshot) => {
    let results = [];
    snapshot.docs.forEach((doc) => {
      results.push({
        ...doc.data(),
        id: doc.id,
      });
    });

    setDocuments(results);
    setError(null);
  };
  const handleError = (error) => {
    console.log('useCollectionError', error);
    setError(error);
  };
  useEffect(() => {
    let ref = collection(db, path);
    if (query) {
      const [field, filter, value] = query;
      // ref = where(field, filter, value);
    }
    if (oBy) {
      const [field, direction] = oBy;
      // ref = orderBy(field, direction);
    }

    if (realtime) {
      const unsubscribe = onSnapshot(
        ref,
        (snapshot) => {
          snapshotToDocument(snapshot);
          return unsubscribe;
        },
        handleError
      );
    } else {
      getDocs(ref).then((snapshot) => {
        snapshotToDocument(snapshot);
      }, handleError);
    }
  }, [path, realtime, oBy, query]);

  return {
    documents,
    error,
  };
};
