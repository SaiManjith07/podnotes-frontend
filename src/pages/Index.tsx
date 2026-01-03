import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { 
  Headphones, 
  ArrowRight, 
  Sparkles, 
  FileText, 
  Zap,
  MessageSquare
} from 'lucide-react';

export default function Index() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && user) {
      navigate('/dashboard');
    }
  }, [user, isLoading, navigate]);

  const features = [
    {
      icon: Zap,
      title: 'Instant Transcription',
      description: 'Paste a YouTube link and get accurate transcripts in seconds.',
    },
    {
      icon: Sparkles,
      title: 'AI-Powered Insights',
      description: 'Get key takeaways, summaries, and actionable advice automatically.',
    },
    {
      icon: MessageSquare,
      title: 'Ask Questions',
      description: 'Choose what you want to learn and get personalized answers.',
    },
    {
      icon: FileText,
      title: 'Beautiful Notes',
      description: 'Save and organize your podcast notes in one place.',
    },
  ];

  return (
    <div className="min-h-screen gradient-warm relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 rounded-full bg-primary/10 blur-3xl animate-float" />
        <div className="absolute bottom-40 left-20 w-80 h-80 rounded-full bg-accent/10 blur-3xl animate-float delay-500" />
      </div>

      {/* Header */}
      <header className="relative z-10 container max-w-6xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
              <Headphones className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-display font-bold text-foreground">PodNotes</span>
          </div>
          <Link to="/auth">
            <Button variant="outline" className="font-body">
              Sign In
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 container max-w-6xl mx-auto px-4 pt-20 pb-32">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6 animate-slide-up">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium font-body">AI-Powered Podcast Notes</span>
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold text-foreground mb-6 animate-slide-up delay-100">
            Transform podcasts into{' '}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              actionable insights
            </span>
          </h1>

          <p className="text-xl text-muted-foreground font-body mb-10 animate-slide-up delay-200 max-w-2xl mx-auto">
            Paste a YouTube link, and let AI transcribe, summarize, and answer your questions. 
            Never miss a key insight again.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up delay-300">
            <Link to="/auth">
              <Button size="lg" className="gradient-primary text-primary-foreground font-body font-medium px-8 hover:opacity-90 transition-opacity">
                Get Started Free
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="font-body">
              Watch Demo
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-24">
          {features.map((feature, index) => (
            <div 
              key={feature.title}
              className="p-6 rounded-2xl bg-card border border-border hover:border-primary/50 hover:shadow-lg transition-all animate-slide-up group"
              style={{ animationDelay: `${400 + index * 100}ms` }}
            >
              <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <feature.icon className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="text-lg font-display font-semibold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-muted-foreground font-body text-sm">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Social Proof */}
        <div className="text-center mt-24 animate-slide-up delay-500">
          <p className="text-sm text-muted-foreground font-body mb-4">
            Trusted by podcast enthusiasts worldwide
          </p>
          <div className="flex items-center justify-center gap-8 opacity-60">
            <div className="text-2xl">🎧</div>
            <div className="text-2xl">📝</div>
            <div className="text-2xl">✨</div>
            <div className="text-2xl">🚀</div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border bg-card/50 backdrop-blur-sm">
        <div className="container max-w-6xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                <Headphones className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-display font-bold text-foreground">PodNotes</span>
            </div>
            <p className="text-sm text-muted-foreground font-body">
              © 2024 PodNotes. Transform the way you consume podcasts.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
