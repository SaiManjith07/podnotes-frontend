import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useNotes } from '@/contexts/NotesContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { 
  ArrowLeft, 
  ExternalLink, 
  Clock, 
  MessageCircle,
  Lightbulb,
  FileText,
  Share2,
  CheckCircle2,
  Bot,
  Copy,
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import UserProfileMenu from '@/components/UserProfileMenu';
import NoteChatPanel from '@/components/NoteChatPanel';

export default function NoteDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { getNoteById, getTranscriptById } = useNotes();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('summary');
  const [focusedTakeawayIdx, setFocusedTakeawayIdx] = useState<number | null>(0);
  const [copiedAnswerKey, setCopiedAnswerKey] = useState<string | null>(null);

  const note = id ? getNoteById(id) : undefined;
  const transcriptDoc = note ? getTranscriptById(note.transcriptId) : undefined;
  const transcriptText = transcriptDoc?.transcript ?? '';

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  if (!user) return null;

  if (!note) {
    return (
      <div className="min-h-screen-safe bg-background flex items-center justify-center safe-px py-8">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-display font-semibold text-foreground mb-2">
              Note not found
            </h2>
            <p className="text-muted-foreground font-body mb-4">
              This note may have been deleted or doesn't exist.
            </p>
            <Button onClick={() => navigate('/my-notes')} className="font-body">
              Go to My Notes
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied!",
        description: "Share link has been copied to clipboard",
      });
    } catch {
      toast({
        title: "Couldn't copy link",
        description: "Please copy the URL manually",
        variant: "destructive",
      });
    }
  };

  const handleCopyText = async (value: string, key: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedAnswerKey(key);
      toast({
        title: 'Copied',
        description: 'Text copied to clipboard',
      });
      window.setTimeout(() => setCopiedAnswerKey(null), 1500);
    } catch {
      toast({
        title: "Couldn't copy",
        description: "Please copy manually",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen-safe bg-background">
      {/* Hero Section */}
      <div className="relative">
        <div className="absolute top-[max(0.75rem,env(safe-area-inset-top))] right-[max(0.75rem,env(safe-area-inset-right))] z-20">
          <UserProfileMenu />
        </div>
        {note.thumbnail && (
          <div className="absolute inset-0 h-52 sm:h-64 md:h-80">
            <img 
              src={note.thumbnail} 
              alt={note.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/70 to-background" />
          </div>
        )}
        
        <div className="relative container max-w-4xl mx-auto safe-px pt-4 sm:pt-6 pb-6 sm:pb-8">
          {/* Back button */}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/my-notes')}
            className="font-body mb-6 sm:mb-8 min-h-[44px] sm:min-h-0 bg-background/50 backdrop-blur-sm hover:bg-background/80 pr-20 sm:pr-3"
            aria-label="Back to my notes"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Back to Notes</span>
            <span className="sm:hidden">Back</span>
          </Button>

          {/* Title and meta */}
          <div className="animate-slide-up" style={{ animationDelay: '100ms' }}>
            <div className="flex items-center gap-2 mb-3 sm:mb-4 flex-wrap">
              <Badge variant="secondary" className="font-body text-xs sm:text-sm">
                <Clock className="w-3 h-3 mr-1 shrink-0" />
                {format(new Date(note.createdAt), 'MMMM d, yyyy')}
              </Badge>
            </div>
            
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-foreground mb-3 sm:mb-4 text-balance">
              {note.title}
            </h1>

            <p className="text-base sm:text-lg text-muted-foreground font-body mb-5 sm:mb-6 text-pretty">
              {note.summary}
            </p>

            <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-3">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleShare}
                className="font-body w-full sm:w-auto min-h-[44px] sm:min-h-9 justify-center"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(note.youtubeUrl, '_blank')}
                className="font-body w-full sm:w-auto min-h-[44px] sm:min-h-9 justify-center"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                <span className="sm:hidden">Watch on YouTube</span>
                <span className="hidden sm:inline">Watch Original</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="container max-w-4xl mx-auto safe-px py-6 sm:py-8 pb-10 safe-pb">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="animate-slide-up delay-200">
          <TabsList className="flex h-auto w-full items-center justify-between gap-1 rounded-full border border-border/70 bg-card/55 px-1 py-1 backdrop-blur shadow-sm mb-6 sm:mb-8 min-h-[48px]">
            <TabsTrigger
              value="summary"
              className="flex-1 rounded-full border border-transparent font-body text-[11px] sm:text-sm gap-1.5 text-muted-foreground hover:bg-muted/60 hover:text-foreground data-[state=active]:bg-primary/15 data-[state=active]:text-foreground data-[state=active]:border-primary/40 data-[state=active]:ring-1 data-[state=active]:ring-primary/30 data-[state=active]:shadow-glow min-h-[44px]"
            >
              <Lightbulb className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span className="truncate">Insights</span>
            </TabsTrigger>
            <TabsTrigger
              value="qa"
              className="flex-1 rounded-full border border-transparent font-body text-[11px] sm:text-sm gap-1.5 text-muted-foreground hover:bg-muted/60 hover:text-foreground data-[state=active]:bg-primary/15 data-[state=active]:text-foreground data-[state=active]:border-primary/40 data-[state=active]:ring-1 data-[state=active]:ring-primary/30 data-[state=active]:shadow-glow min-h-[44px]"
            >
              <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span className="truncate">Q&amp;A</span>
            </TabsTrigger>
            <TabsTrigger
              value="chat"
              className="flex-1 rounded-full border border-transparent font-body text-[11px] sm:text-sm gap-1.5 text-muted-foreground hover:bg-muted/60 hover:text-foreground data-[state=active]:bg-primary/15 data-[state=active]:text-foreground data-[state=active]:border-primary/40 data-[state=active]:ring-1 data-[state=active]:ring-primary/30 data-[state=active]:shadow-glow min-h-[44px]"
            >
              <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span className="truncate">Chat</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="summary" className="space-y-6">
            {/* Summary Section */}
            <Card className="border border-border bg-card/50 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base sm:text-lg font-display flex items-center gap-2">
                  <FileText className="w-5 h-5 text-accent shrink-0" />
                  Summary
                </CardTitle>
                <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs text-muted-foreground font-body">
                  <span className="inline-flex w-2 h-2 rounded-full gradient-primary" aria-hidden />
                  AI-generated, grounded in transcript
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-foreground font-body leading-relaxed text-pretty">
                  {note.summary}
                </p>
                <div className="mt-5 flex flex-col sm:flex-row gap-2">
                  <Button
                    variant="outline"
                    className="w-full sm:w-auto font-body min-h-[44px]"
                    onClick={() => setActiveTab('chat')}
                  >
                    <Bot className="w-4 h-4 mr-2" />
                    Chat about this note
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full sm:w-auto font-body min-h-[44px]"
                    onClick={() => void handleCopyText(note.summary, `summary-${note.id}`)}
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    {copiedAnswerKey === `summary-${note.id}` ? 'Copied' : 'Copy summary'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Key Takeaways */}
            <Card className="border border-border bg-card/50 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base sm:text-lg font-display flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-success shrink-0" />
                  Key Takeaways
                </CardTitle>
                <p className="text-sm text-muted-foreground font-body mt-2">
                  Tap a takeaway to focus on it, then ask the bot follow-ups.
                </p>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {note.keyTakeaways.map((takeaway, index) => {
                    const active = focusedTakeawayIdx === index;
                    return (
                      <button
                        key={index}
                        type="button"
                        onClick={() => setFocusedTakeawayIdx(index)}
                        className={cn(
                          "group rounded-full border px-3 py-2 text-left transition-all",
                          "min-h-[44px] flex items-start gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                          active
                            ? "border-primary/60 bg-primary/10 shadow-glow hover:-translate-y-0.5"
                            : "border-border bg-muted/30 hover:border-primary/30 hover:bg-muted/60 hover:-translate-y-0.5",
                        )}
                        aria-pressed={active}
                      >
                        <span
                          className={cn(
                            "mt-0.5 flex-shrink-0 w-6 h-6 rounded-full text-[11px] font-bold flex items-center justify-center",
                            active ? "gradient-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                          )}
                        >
                          {index + 1}
                        </span>
                        <span className="text-sm font-body leading-snug">
                          {takeaway}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {focusedTakeawayIdx !== null && note.keyTakeaways[focusedTakeawayIdx] && (
                  <div className="mt-5 rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 to-accent/5 p-4 shadow-sm">
                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 w-7 h-7 rounded-full gradient-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                        {focusedTakeawayIdx + 1}
                      </span>
                      <div className="min-w-0">
                        <div className="text-xs uppercase tracking-wide text-primary font-body font-semibold">
                          Focused takeaway
                        </div>
                        <p className="mt-1 text-sm text-foreground font-body leading-relaxed">
                          {note.keyTakeaways[focusedTakeawayIdx]}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="font-body"
                            onClick={() => setActiveTab('chat')}
                          >
                            Ask about this
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="font-body"
                            onClick={() =>
                              void handleCopyText(
                                note.keyTakeaways[focusedTakeawayIdx],
                                `takeaway-${note.id}-${focusedTakeawayIdx}`,
                              )
                            }
                          >
                            {copiedAnswerKey === `takeaway-${note.id}-${focusedTakeawayIdx}` ? 'Copied' : 'Copy'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="qa" className="space-y-3">
            <Accordion type="single" collapsible className="w-full space-y-2">
              {note.questions.map((question, index) => {
                const value = `qa-${note.id}-${index}`;
                const answer = note.answers[question] || "Answer not available";
                return (
                  <AccordionItem
                    key={value}
                    value={value}
                    className="border-b-0 rounded-2xl border border-border/70 bg-card/40 shadow-sm data-[state=open]:border-primary/40 data-[state=open]:bg-primary/5 overflow-hidden"
                  >
                    <AccordionTrigger className="px-3 sm:px-4">
                      <div className="flex items-start gap-3 pr-2">
                        <span className="mt-0.5 w-6 h-6 rounded-full gradient-primary text-primary-foreground text-[11px] font-bold flex items-center justify-center flex-shrink-0">
                          {index + 1}
                        </span>
                        <span className="text-left text-sm sm:text-base font-body font-semibold text-foreground text-pretty">
                          {question}
                        </span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-3 sm:px-4 pb-4 pt-0">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                        <p className="text-muted-foreground font-body whitespace-pre-line leading-relaxed">
                          {answer}
                        </p>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="font-body shrink-0 hover:bg-primary/10 hover:text-primary"
                          onClick={() => void handleCopyText(answer, value)}
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          {copiedAnswerKey === value ? 'Copied' : 'Copy'}
                        </Button>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </TabsContent>

          <TabsContent value="chat" className="space-y-4">
            <NoteChatPanel note={note} transcriptText={transcriptText} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
