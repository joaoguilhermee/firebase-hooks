import { useReducer, useEffect, useState } from 'react';
import db, { timestamp } from 'services/firestore';

let initialState = {
  document: null,
  isPending: false,
  error: null,
  success: null,
};

//update, delete and add
const firestoreReducer = (state, action) => {
  switch (action.type) {
    case 'DELETED':
      return {
        document: null,
        isPending: false,
        success: true,
        error: null,
      };
    case 'UPDATED':
    case 'ADDED':
      return {
        document: action.payload,
        isPending: false,
        success: true,
        error: null,
      };
    case 'IS_PENDING':
      return {
        document: null,
        isPending: true,
        success: false,
        error: null,
      };
    case 'ERROR':
      return {
        isPending: true,
        document: null,
        success: false,
        error: action.payload,
      };

    default:
      return state;
  }
};
export const useFirestore = collection => {
  const [response, dispatch] = useReducer(firestoreReducer, initialState);
  const [isCancelled, setIsCancelled] = useState(false);

  const ref = db.collection(collection);

  const distachIfNotCancelled = action => {
    if (!isCancelled) {
      dispatch(action);
    }
  };
  //add a document

  const add = async doc => {
    dispatch({ type: 'IS_PENDING' });
    try {
      const createdAt = timestamp.fromDate(new Date());
      const added = await ref.add({ ...doc, createdAt });
      distachIfNotCancelled({ type: 'ADDED', payload: added });
    } catch (error) {
      distachIfNotCancelled({ type: 'ERROR', payload: error.message });
    }
  };

  const remove = async id => {
    dispatch({ type: 'IS_PENDING' });
    try {
      await ref.doc(id).delete();
      distachIfNotCancelled({ type: 'DELETED' });
    } catch (error) {
      distachIfNotCancelled({ type: 'ERROR', payload: error.message });
    }
  };
  const update = async (id, data) => {
    dispatch({ type: 'IS_PENDING' });
    try {
      const updated = await ref.doc(id).update(data);
      distachIfNotCancelled({ type: 'UPDATED', payload: updated });
      return updated;
    } catch (error) {
      distachIfNotCancelled({ type: 'ERROR', payload: error.message });
      return null;
    }
  };

  useEffect(() => {
    return () => setIsCancelled(true);
  }, []);

  return {
    add,
    remove,
    response,
    update,
  };
};
