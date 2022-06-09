import { useReducer, useEffect, useState } from 'react';
import db, { timestamp } from '../../services/firestore';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  Timestamp,
  doc,
} from 'firebase/firestore';

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

export const useFirestore = (path) => {
  const [response, dispatch] = useReducer(firestoreReducer, initialState);
  const [isCancelled, setIsCancelled] = useState(false);

  const ref = collection(db, path);

  const distachIfNotCancelled = (action) => {
    if (!isCancelled) {
      dispatch(action);
    }
  };

  const handleError = (error) => {
    console.log('HANDLE ERRROR', error);
    distachIfNotCancelled({ type: 'ERROR', payload: error.message });
  };
  //add a document

  const add = async (doc) => {
    dispatch({ type: 'IS_PENDING' });
    try {
      const createdAt = Timestamp.now();
      const added = await addDoc(ref, { ...doc, createdAt });
      distachIfNotCancelled({ type: 'ADDED', payload: added });
    } catch (error) {
      distachIfNotCancelled({ type: 'ERROR', payload: error.message });
    }
  };

  const remove = async (id) => {
    dispatch({ type: 'IS_PENDING' });
    try {
      const docId = doc(db, path, id);
      deleteDoc(docId).then(() => {
        distachIfNotCancelled({ type: 'DELETED' });
      }, handleError);
    } catch (error) {
      handleError(error);
    }
  };

  const update = async (id, data) => {
    dispatch({ type: 'IS_PENDING' });
    try {
      const docId = doc(db, path, id);
      updateDoc(docId, { ...data }).then(() => {
        distachIfNotCancelled({ type: 'UPDATED' });
      }, handleError);
    } catch (error) {
      handleError(error);
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
