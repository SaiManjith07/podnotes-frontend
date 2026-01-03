import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useNotes } from '@/contexts/NotesContext';
import { INTEREST_CATEGORIES } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Headphones, 
  Plus, 
  FileText, 
  Clock, 
  LogOut, 
  Sparkles,
  ChevronRight,
  Play
} from 'lucide-react';
import ProcessPodcastModal from '@/components/ProcessPodcastModal';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const { notes } = useNotes();
  const navigate = useNavigate();
  const [isProcessModalOpen, setIsProcessModalOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    } else if (user.interests.length === 0) {
      navigate('/interests');
    }
  }, [user, navigate]);

  if (!user) return null;

  const userInterests = INTEREST_CATEGORIES.filter(cat => 
    user.interests.includes(cat.id)
  );

  const recentNotes = notes.slice(0, 3);

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                <Headphones className="w-5 h-5 text-primary-foreground" />
              </div>
              <h1 className="text-xl font-display font-bold text-foreground">PodNotes</h1>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/my-notes">
                <Button variant="ghost" size="sm" className="font-body">
                  <FileText className="w-4 h-4 mr-2" />
                  My Notes
                </Button>
              </Link>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleLogout}
                className="text-muted-foreground hover:text-destructive font-body"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container max-w-6xl mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8 animate-slide-up">
          <h2 className="text-3xl font-display font-bold text-foreground mb-2">
            Welcome back! 👋
          </h2>
          <p className="text-muted-foreground font-body">
            Ready to transform your next podcast into actionable notes?
          </p>
        </div>

        {/* Add Podcast CTA */}
        <Card className="mb-8 border-2 border-dashed border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5 hover:border-primary/50 transition-colors cursor-pointer group animate-slide-up delay-100"
          onClick={() => setIsProcessModalOpen(true)}>
          <CardContent className="p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-primary mb-4 group-hover:scale-110 transition-transform">
              <Plus className="w-8 h-8 text-primary-foreground" />
            </div>
            <h3 className="text-xl font-display font-semibold text-foreground mb-2">
              Add a Podcast
            </h3>
            <p className="text-muted-foreground font-body mb-4 max-w-md mx-auto">
              Paste a YouTube link and we'll transcribe it, answer your questions, and generate beautiful notes.
            </p>
            <Button className="gradient-primary text-primary-foreground font-body">
              <Play className="w-4 h-4 mr-2" />
              Get Started
            </Button>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Your Interests */}
          <div className="lg:col-span-1 animate-slide-up delay-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-display font-semibold text-foreground">Your Interests</h3>
              <Link to="/interests">
                <Button variant="ghost" size="sm" className="text-xs font-body">
                  Edit
                </Button>
              </Link>
            </div>
            <div className="flex flex-wrap gap-2">
              {userInterests.map(interest => (
                <Badge 
                  key={interest.id} 
                  variant="secondary"
                  className="px-3 py-1.5 font-body text-sm"
                >
                  <span className="mr-1">{interest.icon}</span>
                  {interest.label}
                </Badge>
              ))}
            </div>
          </div>

          {/* Recent Notes */}
          <div className="lg:col-span-2 animate-slide-up delay-300">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-display font-semibold text-foreground">Recent Notes</h3>
              {notes.length > 0 && (
                <Link to="/my-notes">
                  <Button variant="ghost" size="sm" className="text-xs font-body">
                    View all
                    <ChevronRight className="w-3 h-3 ml-1" />
                  </Button>
                </Link>
              )}
            </div>

            {recentNotes.length === 0 ? (
              <Card className="border border-border">
                <CardContent className="p-8 text-center">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground font-body">
                    No notes yet. Add your first podcast to get started!
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {recentNotes.map((note, index) => (
                  <Link key={note.id} to={`/notes/${note.id}`}>
                    <Card className={cn(
                      "border border-border hover:border-primary/50 hover:shadow-md transition-all cursor-pointer",
                      "animate-slide-up"
                    )} style={{ animationDelay: `${300 + index * 100}ms` }}>
                      <CardContent className="p-4">
                        <div className="flex gap-4">
                          {note.thumbnail && (
                            <img 
                              src={note.thumbnail} 
                              alt={note.title}
                              className="w-20 h-14 rounded-lg object-cover flex-shrink-0"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-foreground font-body line-clamp-1 mb-1">
                              {note.title}
                            </h4>
                            <p className="text-sm text-muted-foreground font-body line-clamp-2 mb-2">
                              {note.summary}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Clock className="w-3 h-3" />
                              <span className="font-body">
                                {format(new Date(note.createdAt), 'MMM d, yyyy')}
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-8 animate-slide-up delay-400">
          <Card className="border border-border">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-display font-bold text-primary mb-1">
                {notes.length}
              </div>
              <p className="text-sm text-muted-foreground font-body">Notes Created</p>
            </CardContent>
          </Card>
          <Card className="border border-border">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-display font-bold text-accent mb-1">
                {user.interests.length}
              </div>
              <p className="text-sm text-muted-foreground font-body">Interests</p>
            </CardContent>
          </Card>
          <Card className="border border-border">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-display font-bold text-success mb-1">
                <Sparkles className="w-8 h-8 inline" />
              </div>
              <p className="text-sm text-muted-foreground font-body">AI Powered</p>
            </CardContent>
          </Card>
        </div>
      </main>

      <ProcessPodcastModal 
        isOpen={isProcessModalOpen} 
        onClose={() => setIsProcessModalOpen(false)} 
      />
    </div>
  );
}
