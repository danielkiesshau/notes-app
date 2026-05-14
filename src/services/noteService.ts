import * as SecureStore from 'expo-secure-store';

import type { Note } from '../types/note';

const NOTES_STORAGE_KEY = 'notes';

let lastTimestamp = 0;
let timestampCounter = 0;

const generateNoteId = (): string => {
  const timestamp = Date.now();

  if (timestamp === lastTimestamp) {
    timestampCounter += 1;
  } else {
    lastTimestamp = timestamp;
    timestampCounter = 0;
  }

  return `${timestamp}-${timestampCounter}`;
};

const getStoredNotes = async (): Promise<Note[]> => {
  try {
    const storedNotes = await SecureStore.getItemAsync(NOTES_STORAGE_KEY);

    if (!storedNotes) {
      return [];
    }

    const parsedNotes: unknown = JSON.parse(storedNotes);

    if (!Array.isArray(parsedNotes)) {
      return [];
    }

    return parsedNotes as Note[];
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to load notes: ${message}`);
  }
};

const saveNotes = async (notes: Note[]): Promise<void> => {
  try {
    await SecureStore.setItemAsync(NOTES_STORAGE_KEY, JSON.stringify(notes));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to save notes: ${message}`);
  }
};

export const createNote = async (title: string, content: string): Promise<Note> => {
  const now = new Date().toISOString();
  const newNote: Note = {
    id: generateNoteId(),
    title,
    content,
    createdAt: now,
    updatedAt: now,
  };

  const notes = await getStoredNotes();
  await saveNotes([newNote, ...notes]);

  return newNote;
};

export const readNote = async (id: string): Promise<Note | null> => {
  const notes = await getStoredNotes();

  return notes.find((note) => note.id === id) ?? null;
};

export const updateNote = async (id: string, title: string, content: string): Promise<Note> => {
  const notes = await getStoredNotes();
  const noteIndex = notes.findIndex((note) => note.id === id);

  if (noteIndex === -1) {
    throw new Error(`Note with id ${id} was not found`);
  }

  const updatedNote: Note = {
    ...notes[noteIndex],
    title,
    content,
    updatedAt: new Date().toISOString(),
  };

  const updatedNotes = [...notes];
  updatedNotes[noteIndex] = updatedNote;

  await saveNotes(updatedNotes);

  return updatedNote;
};

export const deleteNote = async (id: string): Promise<void> => {
  const notes = await getStoredNotes();
  const filteredNotes = notes.filter((note) => note.id !== id);

  await saveNotes(filteredNotes);
};

export const getAllNotes = async (): Promise<Note[]> => getStoredNotes();
