import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  setDoc,
} from 'firebase/firestore';
import { Note, Transcript } from '@/types';
import { useAuth } from './AuthContext';
import { firebaseDb, isFirebaseConfigured } from '@/lib/firebase';
import { noteFromFirestore, noteToFirestore, transcriptFromFirestore, transcriptToFirestore } from '@/lib/firestoreSerial';

interface NotesContextType {
  notes: Note[];
  transcripts: Transcript[];
  isProcessing: boolean;
  setIsProcessing: (v: boolean) => void;
  addNote: (note: Note) => void;
  addTranscript: (transcript: Transcript) => void;
  getNoteById: (id: string) => Note | undefined;
  getTranscriptById: (id: string) => Transcript | undefined;
  deleteNote: (id: string) => void;
}

const NotesContext = createContext<NotesContextType | undefined>(undefined);

export function NotesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [transcripts, setTranscripts] = useState<Transcript[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!user) {
      setNotes([]);
      setTranscripts([]);
      return;
    }

    if (isFirebaseConfigured && firebaseDb) {
      const notesQ = query(
        collection(firebaseDb, 'users', user.id, 'notes'),
        orderBy('createdAt', 'desc'),
      );
      const trQ = query(
        collection(firebaseDb, 'users', user.id, 'transcripts'),
        orderBy('createdAt', 'desc'),
      );
      const unsubN = onSnapshot(notesQ, (snap) => {
        setNotes(snap.docs.map((d) => noteFromFirestore(d, user.id)));
      });
      const unsubT = onSnapshot(trQ, (snap) => {
        setTranscripts(snap.docs.map((d) => transcriptFromFirestore(d, user.id)));
      });
      return () => {
        unsubN();
        unsubT();
      };
    }

    const storedNotes = localStorage.getItem(`podnotes_notes_${user.id}`);
    if (storedNotes) {
      try {
        const parsed = JSON.parse(storedNotes) as Note[];
        setNotes(
          parsed.map((n) => ({
            ...n,
            createdAt: n.createdAt instanceof Date ? n.createdAt : new Date(n.createdAt as unknown as string),
          })),
        );
      } catch {
        setNotes([]);
      }
    } else {
      setNotes([]);
    }

    const storedTranscripts = localStorage.getItem(`podnotes_transcripts_${user.id}`);
    if (storedTranscripts) {
      try {
        const parsed = JSON.parse(storedTranscripts) as Transcript[];
        setTranscripts(
          parsed.map((t) => ({
            ...t,
            createdAt: t.createdAt instanceof Date ? t.createdAt : new Date(t.createdAt as unknown as string),
          })),
        );
      } catch {
        setTranscripts([]);
      }
    } else {
      setTranscripts([]);
    }

    return undefined;
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps -- bind to uid only

  const addNote = (note: Note) => {
    if (user && isFirebaseConfigured && firebaseDb) {
      const ref = doc(firebaseDb, 'users', user.id, 'notes', note.id);
      void setDoc(ref, noteToFirestore(note)).catch((err) => {
        console.error('[PodNotes] Firestore could not save note — check network, rules, and console:', err);
      });
      return;
    }
    setNotes((prev) => {
      const updated = [note, ...prev];
      if (user) {
        localStorage.setItem(`podnotes_notes_${user.id}`, JSON.stringify(updated));
      }
      return updated;
    });
  };

  const addTranscript = (transcript: Transcript) => {
    if (user && isFirebaseConfigured && firebaseDb) {
      const ref = doc(firebaseDb, 'users', user.id, 'transcripts', transcript.id);
      void setDoc(ref, transcriptToFirestore(transcript)).catch((err) => {
        console.error('[PodNotes] Firestore could not save transcript:', err);
      });
      return;
    }
    setTranscripts((prev) => {
      const updated = [transcript, ...prev];
      if (user) {
        localStorage.setItem(`podnotes_transcripts_${user.id}`, JSON.stringify(updated));
      }
      return updated;
    });
  };

  const getNoteById = (id: string) => notes.find((note) => note.id === id);

  const getTranscriptById = (id: string) => transcripts.find((t) => t.id === id);

  const deleteNote = (id: string) => {
    if (user && isFirebaseConfigured && firebaseDb) {
      void deleteDoc(doc(firebaseDb, 'users', user.id, 'notes', id));
      return;
    }
    setNotes((prev) => {
      const updated = prev.filter((note) => note.id !== id);
      if (user) {
        localStorage.setItem(`podnotes_notes_${user.id}`, JSON.stringify(updated));
      }
      return updated;
    });
  };

  return (
    <NotesContext.Provider
      value={{
        notes,
        transcripts,
        isProcessing,
        setIsProcessing,
        addNote,
        addTranscript,
        getNoteById,
        getTranscriptById,
        deleteNote,
      }}
    >
      {children}
    </NotesContext.Provider>
  );
}

export function useNotes() {
  const context = useContext(NotesContext);
  if (context === undefined) {
    throw new Error('useNotes must be used within a NotesProvider');
  }
  return context;
}
