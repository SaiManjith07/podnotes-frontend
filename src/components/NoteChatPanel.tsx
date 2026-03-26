import { useEffect, useRef, useState } from "react";
import { Bot, Loader2, Send } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import type { Note } from "@/types";
import { API_BASE } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type ChatRole = "user" | "assistant";

type ChatMessage = { role: ChatRole; content: string };

const SUGGESTIONS = [
  "What are the most actionable tips from this episode?",
  "Explain the main topic in simpler terms.",
  "What was not covered that you’d want to ask the host?",
] as const;

type NoteChatPanelProps = {
  note: Note;
  transcriptText: string;
};

export default function NoteChatPanel({ note, transcriptText }: NoteChatPanelProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const hasTranscript = Boolean(transcriptText?.trim());

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, loading]);

  const sendMessage = async (raw: string) => {
    const text = raw.trim();
    if (!text || loading) return;
    if (!user) {
      toast({ title: "Sign in required", variant: "destructive" });
      return;
    }

    const previous = messages;
    const thread: ChatMessage[] = [...previous, { role: "user", content: text }];
    setMessages(thread);
    setInput("");
    setLoading(true);

    const maxTurns = 40;
    let messagesForApi = thread.length > maxTurns ? thread.slice(-maxTurns) : thread;
    while (messagesForApi.length > 0 && messagesForApi[0].role !== "user") {
      messagesForApi = messagesForApi.slice(1);
    }

    try {
      const res = await fetch(`${API_BASE}/api/podcast/note-chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          context: {
            noteId: note.id,
            title: note.title,
            summary: note.summary,
            keyTakeaways: note.keyTakeaways,
            questions: note.questions,
            answers: note.answers,
            transcript: transcriptText,
            youtubeUrl: note.youtubeUrl,
          },
          messages: messagesForApi,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { detail?: unknown; role?: string; content?: string };
      if (!res.ok) {
        const detail =
          typeof data?.detail === "string" ? data.detail : JSON.stringify(data?.detail ?? data);
        throw new Error(detail || `Chat failed (${res.status})`);
      }
      const reply = (data.content ?? "").trim();
      if (!reply) {
        throw new Error("Empty response from assistant.");
      }
      setMessages([...thread, { role: "assistant", content: reply }]);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Chat failed.";
      toast({ title: "Could not get a reply", description: msg, variant: "destructive" });
      setMessages(previous);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void sendMessage(input);
  };

  return (
    <Card className="border border-border overflow-hidden">
      <CardHeader className="pb-2 px-4 sm:px-6 space-y-1.5">
        <CardTitle className="text-base sm:text-lg font-display flex items-center gap-2">
          <Bot className="w-5 h-5 text-primary shrink-0" />
          Chat about this note
        </CardTitle>
        <CardDescription className="font-body text-sm">
          The model receives a fixed template: <span className="font-medium text-foreground">generated notes</span> (this save) plus your{" "}
          <span className="font-medium text-foreground">question</span>
          {hasTranscript ? " and transcript" : ""}. No vector search—context is the note you opened.
        </CardDescription>
        <p className="text-xs text-muted-foreground font-body pt-0.5">
          If you see 404, run <code className="rounded bg-muted px-1 text-[11px]">npm run dev</code> with the API on port 5000 (or{" "}
          <code className="rounded bg-muted px-1 text-[11px]">npm run dev:full</code>) so <code className="rounded bg-muted px-1 text-[11px]">/api</code>{" "}
          proxies to FastAPI.
        </p>
        {!hasTranscript && (
          <p className="text-xs text-amber-700 dark:text-amber-400 font-body mt-2 rounded-md bg-amber-500/10 border border-amber-500/20 px-3 py-2">
            No transcript is available in your library for this note yet. Open the note after a fresh import,
            or ensure the transcript synced from Firestore. Chat still works from summary and Q&amp;A.
          </p>
        )}
      </CardHeader>
      <CardContent className="px-0 sm:px-6 pb-4 space-y-3">
        {messages.length === 0 && (
          <div className="px-4 flex flex-wrap gap-2">
            {SUGGESTIONS.map((s) => (
              <Button
                key={s}
                type="button"
                variant="secondary"
                size="sm"
                className="font-body text-xs h-auto py-2 px-3 text-left whitespace-normal"
                disabled={loading}
                onClick={() => void sendMessage(s)}
              >
                {s}
              </Button>
            ))}
          </div>
        )}

        <ScrollArea className="h-[min(420px,50svh)] sm:h-[min(480px,55svh)] px-4">
          <div className="space-y-3 pr-3">
            {messages.length === 0 && (
              <p className="text-sm text-muted-foreground font-body py-4 text-center">
                Ask anything about this episode. The assistant stays grounded in your saved note.
              </p>
            )}
            {messages.map((m, i) => (
              <div
                key={`${m.role}-${i}-${m.content.slice(0, 24)}`}
                className={cn(
                  "rounded-2xl px-3 py-2.5 text-sm font-body whitespace-pre-wrap",
                  m.role === "user"
                    ? "ml-6 sm:ml-12 bg-primary text-primary-foreground"
                    : "mr-4 sm:mr-10 bg-muted/80 text-foreground border border-border",
                )}
              >
                {m.content}
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-2 text-muted-foreground text-sm font-body py-2">
                <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                Thinking…
              </div>
            )}
            <div ref={bottomRef} className="h-1" aria-hidden />
          </div>
        </ScrollArea>

        <form onSubmit={handleSubmit} className="px-4 flex flex-col sm:flex-row gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a follow-up question…"
            className="min-h-[88px] sm:min-h-[72px] text-base font-body resize-none flex-1"
            disabled={loading}
            rows={3}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void sendMessage(input);
              }
            }}
          />
          <Button
            type="submit"
            className="gradient-primary text-primary-foreground shrink-0 min-h-[48px] sm:min-h-10 sm:self-end"
            disabled={loading || !input.trim()}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            <span className="ml-2 sm:hidden">Send</span>
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
