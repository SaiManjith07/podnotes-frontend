import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useNotes } from '@/contexts/NotesContext';
import { INTEREST_CATEGORIES, PREDEFINED_QUESTIONS, Note, Transcript } from '@/types';
import { API_BASE } from '@/lib/api';
import { firebaseDb, isFirebaseConfigured } from '@/lib/firebase';
import { noteToFirestore, transcriptToFirestore } from '@/lib/firestoreSerial';
import { doc, writeBatch } from 'firebase/firestore';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/hooks/use-toast';
import {
  Loader2,
  Check,
  FileText,
  Sparkles,
  Youtube,
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProcessPodcastModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Step = 'url' | 'questions' | 'processing' | 'complete';

/** POST /api/podcast/from-youtube response */
type PipelineResponse = {
  transcriptId?: string;
  noteId?: string;
  firestoreSaved?: boolean;
  videoTitle: string;
  sourceType: string;
  sourceUrl: string;
  transcript: string;
  answers: Record<string, string>;
  summary: string;
  keyTakeaways: string[];
};

export default function ProcessPodcastModal({ isOpen, onClose }: ProcessPodcastModalProps) {
  const [step, setStep] = useState<Step>('url');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([...PREDEFINED_QUESTIONS]);
  const [videoInfo, setVideoInfo] = useState<{ title: string; thumbnail: string } | null>(null);
  const [processingStep, setProcessingStep] = useState(0);
  const [generatedNote, setGeneratedNote] = useState<Note | null>(null);

  const { user } = useAuth();
  const { addNote, addTranscript, setIsProcessing } = useNotes();
  const navigate = useNavigate();

  const debugLog = (runId: string, hypothesisId: string, message: string, data: Record<string, unknown>) => {
    // #region agent log
    fetch("http://127.0.0.1:7834/ingest/e70bfa47-b8c9-42cc-82af-74e47d9233d1", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Debug-Session-Id": "4b09f5",
      },
      body: JSON.stringify({
        sessionId: "4b09f5",
        runId,
        hypothesisId,
        location: "src/components/ProcessPodcastModal.tsx:startProcessing",
        message,
        data,
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
  };

  const extractVideoId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/shorts\/([^&\n?#]+)/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  const validateUrl = async () => {
    const videoId = extractVideoId(youtubeUrl);
    if (!videoId) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid YouTube video URL",
        variant: "destructive",
      });
      return;
    }

    try {
      const r = await fetch(
        `https://www.youtube.com/oembed?url=${encodeURIComponent(youtubeUrl.trim())}&format=json`,
      );
      if (r.ok) {
        const j = (await r.json()) as { title?: string; thumbnail_url?: string };
        setVideoInfo({
          title: j.title ?? 'YouTube video',
          thumbnail: j.thumbnail_url ?? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
        });
      } else {
        setVideoInfo({
          title: 'YouTube video',
          thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
        });
      }
    } catch {
      setVideoInfo({
        title: 'YouTube video',
        thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
      });
    }

    setStep('questions');
  };

  const toggleQuestion = (question: string) => {
    setSelectedQuestions(prev =>
      prev.includes(question)
        ? prev.filter(q => q !== question)
        : [...prev, question]
    );
  };

  const processSteps = [
    { label: 'Fetching & transcribing (Whisper)', icon: FileText },
    { label: 'Generating notes (LangChain + interests)', icon: Sparkles },
  ];

  const startProcessing = async () => {
    if (!user) {
      toast({ title: "Sign in required", description: "Please sign in first.", variant: "destructive" });
      return;
    }
    if (selectedQuestions.length === 0) {
      toast({
        title: "Select at least one question",
        description: "Choose questions you want answered about the podcast",
        variant: "destructive",
      });
      return;
    }

    setStep('processing');
    setProcessingStep(0);
    setIsProcessing(true);

    const videoId = extractVideoId(youtubeUrl);
    const thumb =
      videoInfo?.thumbnail ??
      (videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : '');

    const interestLabels = INTEREST_CATEGORIES.filter((c) => user.interests.includes(c.id)).map(
      (c) => c.label,
    );

    try {
      debugLog("podcast-submit", "H1", "Submitting from-youtube request", {
        apiBase: API_BASE || "(empty)",
        endpoint: `${API_BASE}/api/podcast/from-youtube`,
        hasUser: Boolean(user?.id),
        questionsCount: selectedQuestions.length,
        youtubeUrlPrefix: youtubeUrl.trim().slice(0, 48),
      });
      const pipelineRes = await fetch(`${API_BASE}/api/podcast/from-youtube`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          youtubeUrl: youtubeUrl.trim(),
          userId: user.id,
          userInterests: user.interests,
          userInterestLabels: interestLabels,
          questions: selectedQuestions,
          thumbnail: thumb,
          duration: '',
        }),
      });
      debugLog("podcast-submit", "H1", "Received from-youtube response metadata", {
        status: pipelineRes.status,
        ok: pipelineRes.ok,
        contentType: pipelineRes.headers.get("content-type") || "(none)",
      });
      setProcessingStep(1);
      const payload = await pipelineRes.json().catch(() => ({}));
      debugLog("podcast-submit", "H2", "Parsed from-youtube payload", {
        status: pipelineRes.status,
        detailType: typeof (payload as { detail?: unknown })?.detail,
        hasDetail: Boolean((payload as { detail?: unknown })?.detail),
      });
      if (!pipelineRes.ok) {
        const detail =
          typeof payload?.detail === 'string'
            ? payload.detail
            : JSON.stringify(payload?.detail ?? payload);
        throw new Error(detail || `Pipeline failed (${pipelineRes.status})`);
      }
      const data = payload as PipelineResponse;

      const transcriptId = data.transcriptId ?? crypto.randomUUID();
      const noteId = data.noteId ?? crypto.randomUUID();
      const transcriptDoc: Transcript = {
        id: transcriptId,
        userId: user.id,
        youtubeUrl: youtubeUrl.trim(),
        title: data.videoTitle,
        thumbnail: thumb,
        transcript: data.transcript,
        duration: '',
        createdAt: new Date(),
      };

      const note: Note = {
        id: noteId,
        userId: user.id,
        transcriptId,
        youtubeUrl: youtubeUrl.trim(),
        title: data.videoTitle,
        thumbnail: thumb,
        questions: selectedQuestions,
        answers: data.answers,
        summary: data.summary,
        keyTakeaways: data.keyTakeaways,
        createdAt: new Date(),
      };

      setGeneratedNote(note);

      if (data.firestoreSaved) {
        // Backend persisted via Firebase Admin; onSnapshot refreshes notes/transcripts.
      } else if (isFirebaseConfigured && firebaseDb) {
        const batch = writeBatch(firebaseDb);
        batch.set(
          doc(firebaseDb, 'users', user.id, 'transcripts', transcriptId),
          transcriptToFirestore(transcriptDoc),
        );
        batch.set(doc(firebaseDb, 'users', user.id, 'notes', noteId), noteToFirestore(note));
        await batch.commit();
      } else {
        addTranscript(transcriptDoc);
        addNote(note);
      }
      setProcessingStep(processSteps.length);
      setStep('complete');
      toast({
        title: 'Notes ready',
        description: 'Transcript and notes are saved to your library.',
      });
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Processing failed.';
      debugLog("podcast-submit", "H4", "Pipeline request failed in catch", {
        errorMessage: message,
      });
      toast({
        title: 'Could not finish pipeline',
        description: message,
        variant: 'destructive',
      });
      setStep('questions');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    setStep('url');
    setYoutubeUrl('');
    setSelectedQuestions([...PREDEFINED_QUESTIONS]);
    setVideoInfo(null);
    setProcessingStep(0);
    setGeneratedNote(null);
    onClose();
  };

  const viewNote = () => {
    if (generatedNote) {
      handleClose();
      navigate(`/notes/${generatedNote.id}`);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg gap-0 sm:gap-4">
        <DialogHeader className="pr-10 sm:pr-0">
          <DialogTitle className="font-display text-lg sm:text-xl text-left">
            {step === 'url' && 'Add a Podcast'}
            {step === 'questions' && 'Choose Your Questions'}
            {step === 'processing' && 'Processing Podcast'}
            {step === 'complete' && 'Notes Ready! 🎉'}
          </DialogTitle>
          <DialogDescription className="font-body">
            {step === 'url' && 'Paste a YouTube link to get started'}
            {step === 'questions' && 'Select the questions you want answered'}
            {step === 'processing' && 'Link → transcript → LangChain (your interests + transcript) → notes'}
            {step === 'complete' && 'Your personalized notes have been generated'}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          {step === 'url' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="youtube-url" className="font-body">YouTube URL</Label>
                <div className="relative">
                  <Youtube className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-red-500" />
                  <Input
                    id="youtube-url"
                    type="url"
                    placeholder="https://youtube.com/watch?v=..."
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    className="pl-11 font-body text-base min-h-[48px]"
                  />
                </div>
              </div>

              <div className="p-3 rounded-lg bg-muted/50 border border-border">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <p className="text-xs text-muted-foreground font-body">
                    Restart the backend after updating so <code className="text-xs">/api/podcast/from-youtube</code> is
                    available. Set <code className="text-xs">GEMINI_API_KEY</code> (or GOOGLE_API_KEY) for notes.
                  </p>
                </div>
              </div>

              <Button
                onClick={() => void validateUrl()}
                className="w-full min-h-[48px] sm:min-h-10 gradient-primary text-primary-foreground font-body"
                disabled={!youtubeUrl}
              >
                Continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}

          {step === 'questions' && (
            <div className="space-y-4">
              {videoInfo && (
                <div className="flex gap-3 p-3 rounded-lg bg-muted/50 border border-border">
                  <img
                    src={videoInfo.thumbnail}
                    alt={videoInfo.title}
                    className="w-24 h-16 rounded object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-foreground font-body line-clamp-2">
                      {videoInfo.title}
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {PREDEFINED_QUESTIONS.map((question) => (
                  <label
                    key={question}
                    className={cn(
                      "flex items-start gap-3 p-3 sm:p-3 rounded-lg border cursor-pointer transition-colors min-h-[52px] active:bg-muted/50",
                      selectedQuestions.includes(question)
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <Checkbox
                      checked={selectedQuestions.includes(question)}
                      onCheckedChange={() => toggleQuestion(question)}
                      className="mt-0.5 shrink-0"
                    />
                    <span className="text-sm font-body text-foreground text-pretty leading-snug">{question}</span>
                  </label>
                ))}
              </div>

              <Button
                onClick={() => void startProcessing()}
                className="w-full min-h-[48px] sm:min-h-10 gradient-primary text-primary-foreground font-body"
                disabled={selectedQuestions.length === 0}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Notes
              </Button>
            </div>
          )}

          {step === 'processing' && (
            <div className="py-8">
              <div className="space-y-4">
                {processSteps.map((s, index) => {
                  const Icon = s.icon;
                  const isComplete = index < processingStep;
                  const isActive = index === processingStep;

                  return (
                    <div
                      key={s.label}
                      className={cn(
                        "flex items-center gap-4 p-4 rounded-lg transition-all",
                        isActive && "bg-primary/10",
                        isComplete && "opacity-50"
                      )}
                    >
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center",
                        isComplete ? "bg-success text-success-foreground" :
                        isActive ? "gradient-primary text-primary-foreground" :
                        "bg-muted text-muted-foreground"
                      )}>
                        {isComplete ? (
                          <Check className="w-5 h-5" />
                        ) : isActive ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <Icon className="w-5 h-5" />
                        )}
                      </div>
                      <span className={cn(
                        "font-body font-medium",
                        isActive ? "text-foreground" : "text-muted-foreground"
                      )}>
                        {s.label}
                      </span>
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-muted-foreground font-body mt-4 text-center">
                This can take a few minutes on long videos.
              </p>
            </div>
          )}

          {step === 'complete' && (
            <div className="text-center py-6">
              <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-success" />
              </div>
              <h3 className="text-lg font-display font-semibold text-foreground mb-2">
                Notes Generated!
              </h3>
              <p className="text-sm text-muted-foreground font-body mb-6">
                Your personalized notes are ready to view.
              </p>
              <div className="flex flex-col-reverse sm:flex-row gap-3">
                <Button variant="outline" onClick={handleClose} className="flex-1 font-body min-h-[48px] sm:min-h-10">
                  Close
                </Button>
                <Button onClick={viewNote} className="flex-1 gradient-primary text-primary-foreground font-body min-h-[48px] sm:min-h-10">
                  View Notes
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
