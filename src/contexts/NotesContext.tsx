import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Note, Transcript } from '@/types';
import { useAuth } from './AuthContext';

interface NotesContextType {
  notes: Note[];
  transcripts: Transcript[];
  isProcessing: boolean;
  addNote: (note: Note) => void;
  addTranscript: (transcript: Transcript) => void;
  getNoteById: (id: string) => Note | undefined;
  deleteNote: (id: string) => void;
}

const NotesContext = createContext<NotesContextType | undefined>(undefined);

export function NotesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [transcripts, setTranscripts] = useState<Transcript[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (user) {
      // Load notes from localStorage
      const storedNotes = localStorage.getItem(`podnotes_notes_${user.id}`);
      if (storedNotes) {
        setNotes(JSON.parse(storedNotes));
      }

      const storedTranscripts = localStorage.getItem(`podnotes_transcripts_${user.id}`);
      if (storedTranscripts) {
        setTranscripts(JSON.parse(storedTranscripts));
      }
    } else {
      setNotes([]);
      setTranscripts([]);
    }
  }, [user]);

  const addNote = (note: Note) => {
    const updatedNotes = [note, ...notes];
    setNotes(updatedNotes);
    if (user) {
      localStorage.setItem(`podnotes_notes_${user.id}`, JSON.stringify(updatedNotes));
    }
  };

  const addTranscript = (transcript: Transcript) => {
    const updatedTranscripts = [transcript, ...transcripts];
    setTranscripts(updatedTranscripts);
    if (user) {
      localStorage.setItem(`podnotes_transcripts_${user.id}`, JSON.stringify(updatedTranscripts));
    }
  };

  const getNoteById = (id: string) => {
    return notes.find(note => note.id === id);
  };

  const deleteNote = (id: string) => {
    const updatedNotes = notes.filter(note => note.id !== id);
    setNotes(updatedNotes);
    if (user) {
      localStorage.setItem(`podnotes_notes_${user.id}`, JSON.stringify(updatedNotes));
    }
  };

  return (
    <NotesContext.Provider value={{ 
      notes, 
      transcripts, 
      isProcessing, 
      addNote, 
      addTranscript, 
      getNoteById, 
      deleteNote 
    }}>
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
