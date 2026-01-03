import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useNotes } from '@/contexts/NotesContext';
import { PREDEFINED_QUESTIONS, Note } from '@/types';
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
  Link2, 
  Loader2, 
  Check, 
  Play, 
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

export default function ProcessPodcastModal({ isOpen, onClose }: ProcessPodcastModalProps) {
  const [step, setStep] = useState<Step>('url');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([...PREDEFINED_QUESTIONS]);
  const [videoInfo, setVideoInfo] = useState<{ title: string; thumbnail: string } | null>(null);
  const [processingStep, setProcessingStep] = useState(0);
  const [generatedNote, setGeneratedNote] = useState<Note | null>(null);
  
  const { user } = useAuth();
  const { addNote } = useNotes();
  const navigate = useNavigate();

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

  const validateUrl = () => {
    const videoId = extractVideoId(youtubeUrl);
    if (!videoId) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid YouTube video URL",
        variant: "destructive",
      });
      return;
    }

    // Mock video info - in production this would call YouTube API
    setVideoInfo({
      title: "Sample Podcast Episode - Understanding AI and the Future",
      thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
    });
    
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
    { label: 'Extracting audio', icon: Play },
    { label: 'Transcribing content', icon: FileText },
    { label: 'Analyzing with AI', icon: Sparkles },
    { label: 'Generating notes', icon: Check },
  ];

  const startProcessing = async () => {
    if (selectedQuestions.length === 0) {
      toast({
        title: "Select at least one question",
        description: "Choose questions you want answered about the podcast",
        variant: "destructive",
      });
      return;
    }

    setStep('processing');

    // Simulate processing steps
    for (let i = 0; i < processSteps.length; i++) {
      setProcessingStep(i);
      await new Promise(resolve => setTimeout(resolve, 1500));
    }

    // Generate mock note
    const videoId = extractVideoId(youtubeUrl);
    const note: Note = {
      id: crypto.randomUUID(),
      userId: user!.id,
      transcriptId: crypto.randomUUID(),
      youtubeUrl,
      title: videoInfo?.title || 'Podcast Episode',
      thumbnail: videoInfo?.thumbnail || `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
      questions: selectedQuestions,
      answers: {
        "What are the main topics discussed?": "This podcast covers artificial intelligence, machine learning fundamentals, and their practical applications in everyday life. The discussion also touches on ethical considerations and future predictions.",
        "What are the key takeaways?": "1. AI is becoming more accessible to non-technical users\n2. Ethical AI development is crucial\n3. The job market will transform, not disappear\n4. Continuous learning is essential in the AI age",
        "Who are the speakers/guests?": "The episode features Dr. Sarah Chen, AI researcher at Stanford, and Marcus Williams, tech entrepreneur and author of 'The AI Revolution'.",
        "What actionable advice is given?": "Start with free AI tools to understand capabilities, take online courses in AI basics, focus on skills that complement AI rather than compete with it, and stay updated with AI news and developments.",
        "Summary in 3 bullet points": "• AI is transforming industries faster than expected\n• Human creativity and emotional intelligence remain irreplaceable\n• The key to thriving is adaptation and continuous learning",
      },
      summary: "A comprehensive discussion on artificial intelligence and its impact on society, featuring expert insights on the future of work, ethical considerations, and practical advice for adapting to an AI-driven world.",
      keyTakeaways: [
        "AI is becoming more accessible to non-technical users",
        "Ethical AI development is crucial for sustainable progress",
        "The job market will transform rather than disappear",
        "Continuous learning is essential in the AI age",
      ],
      createdAt: new Date(),
    };

    setGeneratedNote(note);
    addNote(note);
    setStep('complete');
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
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            {step === 'url' && 'Add a Podcast'}
            {step === 'questions' && 'Choose Your Questions'}
            {step === 'processing' && 'Processing Podcast'}
            {step === 'complete' && 'Notes Ready! 🎉'}
          </DialogTitle>
          <DialogDescription className="font-body">
            {step === 'url' && 'Paste a YouTube link to get started'}
            {step === 'questions' && 'Select the questions you want answered'}
            {step === 'processing' && 'Please wait while we analyze your podcast'}
            {step === 'complete' && 'Your personalized notes have been generated'}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          {/* Step: URL Input */}
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
                    className="pl-11 font-body"
                  />
                </div>
              </div>

              <div className="p-3 rounded-lg bg-muted/50 border border-border">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <p className="text-xs text-muted-foreground font-body">
                    For best results, use podcast episodes that are 10-60 minutes long.
                  </p>
                </div>
              </div>

              <Button 
                onClick={validateUrl} 
                className="w-full gradient-primary text-primary-foreground font-body"
                disabled={!youtubeUrl}
              >
                Continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}

          {/* Step: Questions Selection */}
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
                      "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
                      selectedQuestions.includes(question)
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <Checkbox
                      checked={selectedQuestions.includes(question)}
                      onCheckedChange={() => toggleQuestion(question)}
                    />
                    <span className="text-sm font-body text-foreground">{question}</span>
                  </label>
                ))}
              </div>

              <Button 
                onClick={startProcessing} 
                className="w-full gradient-primary text-primary-foreground font-body"
                disabled={selectedQuestions.length === 0}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Notes
              </Button>
            </div>
          )}

          {/* Step: Processing */}
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
            </div>
          )}

          {/* Step: Complete */}
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
              <div className="flex gap-3">
                <Button variant="outline" onClick={handleClose} className="flex-1 font-body">
                  Close
                </Button>
                <Button onClick={viewNote} className="flex-1 gradient-primary text-primary-foreground font-body">
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
