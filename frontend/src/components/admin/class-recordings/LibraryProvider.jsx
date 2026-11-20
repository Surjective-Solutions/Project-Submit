'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as adminApi from '@/class-recordings/api';
import { useTransitionReady } from '@/components/PageTransition';

const LibraryContext = createContext(null);

export const useLibrary = () => useContext(LibraryContext);

// Holds one tutor's folders and recordings while you move between their folders. It lives in the tutor's layout,
// so opening a folder doesn't load everything again.
// `api` is the admin API unless a teacher's own API (teacherApi.js) is passed.
export default function LibraryProvider({ tutorId, api = adminApi, children }) {
  const [state, setState] = useState({ status: 'loading', error: '', tutor: null, folders: [], recordings: [] });

  // while the library loads, an opening page transition keeps the screen covered
  useTransitionReady(state.status !== 'loading');

  useEffect(() => {
    let cancelled = false;
    setState({ status: 'loading', error: '', tutor: null, folders: [], recordings: [] });
    api
      .getLibrary(tutorId)
      .then((library) => {
        if (!cancelled) setState({ status: 'ready', error: '', ...library });
      })
      .catch((err) => {
        if (!cancelled) {
          setState({ status: 'error', error: err?.message || 'Could not load the recordings.', tutor: null, folders: [], recordings: [] });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [tutorId, api]);

  const createFolder = useCallback(
    async ({ parentId, name }) => {
      const folder = await api.createFolder({ tutorId, parentId, name });
      setState((s) => ({ ...s, folders: [...s.folders, folder] }));
      return folder;
    },
    [tutorId, api]
  );

  const updateFolder = useCallback(async (id, changes) => {
    const folder = await api.updateFolder(id, changes);
    setState((s) => ({ ...s, folders: s.folders.map((f) => (f.id === id ? folder : f)) }));
    return folder;
  }, [api]);

  const updateRecording = useCallback(async (id, changes) => {
    const recording = await api.updateRecording(id, changes);
    setState((s) => ({ ...s, recordings: s.recordings.map((r) => (r.id === id ? recording : r)) }));
    return recording;
  }, [api]);

  const uploadRecording = useCallback((payload, options) => api.uploadRecording(payload, options), [api]);

  // A recording that was just uploaded (the upload dialog calls the API itself).
  const addRecording = useCallback((recording) => {
    setState((s) => ({ ...s, recordings: [...s.recordings, recording] }));
  }, []);

  const value = useMemo(
    () => ({ ...state, actions: { createFolder, updateFolder, updateRecording, uploadRecording, addRecording } }),
    [state, createFolder, updateFolder, updateRecording, uploadRecording, addRecording]
  );

  return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>;
}
