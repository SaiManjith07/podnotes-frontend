import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useNotes } from '@/contexts/NotesContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  ExternalLink, 
  Clock, 
  MessageCircle,
  Lightbulb,
  FileText,
  Share2,
  Bookmark,
  CheckCircle2
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function NoteDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { getNoteById } = useNotes();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('summary');

  const note = id ? getNoteById(id) : undefined;

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  if (!user) return null;

  if (!note) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
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

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative">
        {note.thumbnail && (
          <div className="absolute inset-0 h-80">
            <img 
              src={note.thumbnail} 
              alt={note.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/70 to-background" />
          </div>
        )}
        
        <div className="relative container max-w-4xl mx-auto px-4 pt-6 pb-8">
          {/* Back button */}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/my-notes')}
            className="font-body mb-8 bg-background/50 backdrop-blur-sm hover:bg-background/80"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Notes
          </Button>

          {/* Title and meta */}
          <div className="animate-slide-up" style={{ animationDelay: '100ms' }}>
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="secondary" className="font-body">
                <Clock className="w-3 h-3 mr-1" />
                {format(new Date(note.createdAt), 'MMMM d, yyyy')}
              </Badge>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
              {note.title}
            </h1>

            <p className="text-lg text-muted-foreground font-body mb-6">
              {note.summary}
            </p>

            <div className="flex flex-wrap gap-3">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleShare}
                className="font-body"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(note.youtubeUrl, '_blank')}
                className="font-body"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Watch Original
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="container max-w-4xl mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="animate-slide-up delay-200">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="summary" className="font-body">
              <Lightbulb className="w-4 h-4 mr-2" />
              Key Insights
            </TabsTrigger>
            <TabsTrigger value="qa" className="font-body">
              <MessageCircle className="w-4 h-4 mr-2" />
              Q&A
            </TabsTrigger>
          </TabsList>

          <TabsContent value="summary" className="space-y-6">
            {/* Key Takeaways */}
            <Card className="border border-border">
              <CardHeader>
                <CardTitle className="text-lg font-display flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-success" />
                  Key Takeaways
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {note.keyTakeaways.map((takeaway, index) => (
                    <li 
                      key={index}
                      className={cn(
                        "flex items-start gap-3 p-3 rounded-lg bg-muted/50 animate-slide-up"
                      )}
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <span className="flex-shrink-0 w-6 h-6 rounded-full gradient-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                        {index + 1}
                      </span>
                      <span className="text-foreground font-body">{takeaway}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Summary Section */}
            <Card className="border border-border">
              <CardHeader>
                <CardTitle className="text-lg font-display flex items-center gap-2">
                  <FileText className="w-5 h-5 text-accent" />
                  Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground font-body leading-relaxed">
                  {note.summary}
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="qa" className="space-y-4">
            {note.questions.map((question, index) => (
              <Card 
                key={question}
                className={cn(
                  "border border-border animate-slide-up"
                )}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-body font-semibold text-foreground">
                    {question}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground font-body whitespace-pre-line">
                    {note.answers[question] || "Answer not available"}
                  </p>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
