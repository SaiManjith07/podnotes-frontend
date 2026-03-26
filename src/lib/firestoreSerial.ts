import type { QueryDocumentSnapshot } from "firebase/firestore";
import { Timestamp } from "firebase/firestore";
import type { Note, Transcript } from "@/types";

export function noteToFirestore(note: Note): Record<string, unknown> {
  const created =
    note.createdAt instanceof Date ? note.createdAt : new Date(note.createdAt as unknown as string);
  return {
    transcriptId: note.transcriptId,
    youtubeUrl: note.youtubeUrl,
    title: note.title,
    thumbnail: note.thumbnail,
    questions: note.questions,
    answers: note.answers,
    summary: note.summary,
    keyTakeaways: note.keyTakeaways,
    createdAt: Timestamp.fromDate(created),
  };
}

export function transcriptToFirestore(t: Transcript): Record<string, unknown> {
  const created =
    t.createdAt instanceof Date ? t.createdAt : new Date(t.createdAt as unknown as string);
  return {
    youtubeUrl: t.youtubeUrl,
    title: t.title,
    thumbnail: t.thumbnail,
    transcript: t.transcript,
    duration: t.duration,
    createdAt: Timestamp.fromDate(created),
  };
}

export function noteFromFirestore(docSnap: QueryDocumentSnapshot, userId: string): Note {
  const data = docSnap.data();
  const createdRaw = data.createdAt;
  const createdAt =
    createdRaw instanceof Timestamp ? createdRaw.toDate() : new Date(createdRaw as string);
  return {
    id: docSnap.id,
    userId,
    transcriptId: data.transcriptId as string,
    youtubeUrl: data.youtubeUrl as string,
    title: data.title as string,
    thumbnail: data.thumbnail as string,
    questions: data.questions as string[],
    answers: data.answers as Record<string, string>,
    summary: data.summary as string,
    keyTakeaways: data.keyTakeaways as string[],
    createdAt,
  };
}

export function transcriptFromFirestore(
  docSnap: QueryDocumentSnapshot,
  userId: string,
): Transcript {
  const data = docSnap.data();
  const createdRaw = data.createdAt;
  const createdAt =
    createdRaw instanceof Timestamp ? createdRaw.toDate() : new Date(createdRaw as string);
  return {
    id: docSnap.id,
    userId,
    youtubeUrl: data.youtubeUrl as string,
    title: data.title as string,
    thumbnail: data.thumbnail as string,
    transcript: data.transcript as string,
    duration: (data.duration as string) ?? "",
    createdAt,
  };
}
