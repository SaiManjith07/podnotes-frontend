import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useNotes } from '@/contexts/NotesContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  Headphones, 
  ArrowLeft, 
  Search, 
  FileText, 
  Clock,
  Trash2,
  Plus
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import ProcessPodcastModal from '@/components/ProcessPodcastModal';
import UserProfileMenu from '@/components/UserProfileMenu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from '@/hooks/use-toast';

export default function MyNotes() {
  const { user } = useAuth();
  const { notes, deleteNote } = useNotes();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isProcessModalOpen, setIsProcessModalOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  if (!user) return null;

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.summary.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = (id: string) => {
    deleteNote(id);
    toast({
      title: "Note deleted",
      description: "The note has been removed from your library",
    });
  };

  return (
    <div className="min-h-screen-safe bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50 safe-pt">
        <div className="container max-w-6xl mx-auto safe-px py-3 sm:py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/dashboard')}
                className="font-body shrink-0 h-10 px-2 sm:px-3"
                aria-label="Back to dashboard"
              >
                <ArrowLeft className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Back</span>
              </Button>
              <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                <div className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 rounded-xl gradient-primary flex items-center justify-center">
                  <Headphones className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground" />
                </div>
                <h1 className="text-lg sm:text-xl font-display font-bold text-foreground truncate">My Notes</h1>
              </div>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto sm:justify-end">
              <UserProfileMenu />
              <Button 
                onClick={() => setIsProcessModalOpen(true)}
                className="gradient-primary text-primary-foreground font-body flex-1 sm:flex-initial h-11 sm:h-10 min-h-[44px] sm:min-h-0"
              >
                <Plus className="w-4 h-4 sm:mr-2" />
                Add Podcast
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container max-w-6xl mx-auto safe-px py-6 sm:py-8 safe-pb">
        {/* Search */}
        <div className="mb-8 animate-slide-up">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 font-body"
            />
          </div>
        </div>

        {/* Notes Grid */}
        {filteredNotes.length === 0 ? (
          <Card className="border border-border animate-slide-up delay-100">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-display font-semibold text-foreground mb-2">
                {searchQuery ? 'No notes found' : 'No notes yet'}
              </h3>
              <p className="text-muted-foreground font-body mb-6">
                {searchQuery 
                  ? 'Try adjusting your search terms' 
                  : 'Add your first podcast to generate notes'}
              </p>
              {!searchQuery && (
                <Button 
                  onClick={() => setIsProcessModalOpen(true)}
                  className="gradient-primary text-primary-foreground font-body"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Podcast
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredNotes.map((note, index) => (
              <Card 
                key={note.id}
                className={cn(
                  "border border-border hover:border-primary/50 hover:shadow-lg transition-all group animate-slide-up overflow-hidden"
                )}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <Link to={`/notes/${note.id}`}>
                  {note.thumbnail && (
                    <div className="relative h-40 overflow-hidden">
                      <img 
                        src={note.thumbnail} 
                        alt={note.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                    </div>
                  )}
                </Link>
                <CardContent className="p-4">
                  <Link to={`/notes/${note.id}`}>
                    <h4 className="font-medium text-foreground font-body line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                      {note.title}
                    </h4>
                    <p className="text-sm text-muted-foreground font-body line-clamp-2 mb-3">
                      {note.summary}
                    </p>
                  </Link>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      <span className="font-body">
                        {format(new Date(note.createdAt), 'MMM d, yyyy')}
                      </span>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-muted-foreground hover:text-destructive opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity h-10 w-10 p-0 shrink-0"
                          aria-label="Delete note"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle className="font-display">Delete this note?</AlertDialogTitle>
                          <AlertDialogDescription className="font-body">
                            This action cannot be undone. This will permanently delete the note and all associated data.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="font-body">Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleDelete(note.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 font-body"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Notes count */}
        {filteredNotes.length > 0 && (
          <p className="text-center text-sm text-muted-foreground mt-8 font-body">
            Showing {filteredNotes.length} {filteredNotes.length === 1 ? 'note' : 'notes'}
          </p>
        )}
      </main>

      <ProcessPodcastModal 
        isOpen={isProcessModalOpen} 
        onClose={() => setIsProcessModalOpen(false)} 
      />
    </div>
  );
}
