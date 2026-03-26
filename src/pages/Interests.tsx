import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { INTEREST_CATEGORIES } from '@/types';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { ArrowRight, Check, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import UserProfileMenu from '@/components/UserProfileMenu';

export default function Interests() {
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user, updateInterests } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (user?.interests?.length) {
      setSelectedInterests([...user.interests]);
    }
  }, [user?.interests]);

  const toggleInterest = (id: string) => {
    setSelectedInterests(prev => 
      prev.includes(id) 
        ? prev.filter(i => i !== id)
        : [...prev, id]
    );
  };

  const handleContinue = async () => {
    if (selectedInterests.length < 1) {
      toast({
        title: "Select at least one interest",
        description: "This helps us personalize your experience",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await updateInterests(selectedInterests);
      toast({
        title: "Interests saved!",
        description: "Your feed will be personalized — stored in your account.",
      });
      navigate('/dashboard');
    } catch {
      toast({
        title: "Could not save interests",
        description: "Check your connection and Firebase rules, then try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen-safe gradient-warm relative overflow-x-hidden">
      <div className="fixed z-50 top-[max(1rem,env(safe-area-inset-top))] right-[max(1rem,env(safe-area-inset-right))]">
        <UserProfileMenu />
      </div>
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-64 h-64 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-20 left-10 w-80 h-80 rounded-full bg-accent/5 blur-3xl" />
      </div>

      <div className="container max-w-4xl mx-auto safe-px pt-14 sm:pt-12 pb-10 sm:pb-12 relative z-10 safe-pb">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12 animate-slide-up">
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-primary/10 text-primary mb-3 sm:mb-4 max-w-[calc(100vw-2rem)]">
            <Sparkles className="w-4 h-4 shrink-0" />
            <span className="text-xs sm:text-sm font-medium font-body">Personalize your experience</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-foreground mb-3 sm:mb-4 text-balance px-1">
            What interests you?
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground font-body max-w-md mx-auto text-pretty px-1">
            Select topics you're passionate about. We'll use this to curate your podcast notes.
          </p>
        </div>

        {/* Interest Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 mb-8 sm:mb-12">
          {INTEREST_CATEGORIES.map((category, index) => {
            const isSelected = selectedInterests.includes(category.id);
            return (
              <button
                key={category.id}
                onClick={() => toggleInterest(category.id)}
                className={cn(
                  "relative p-4 sm:p-6 rounded-xl sm:rounded-2xl border-2 transition-all duration-200 animate-slide-up group",
                  "active:scale-[0.98] sm:hover:scale-105 sm:hover:shadow-lg min-h-[100px] sm:min-h-0",
                  isSelected 
                    ? "border-primary bg-primary/5 shadow-md" 
                    : "border-border bg-card hover:border-primary/50"
                )}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {isSelected && (
                  <div className="absolute top-2 right-2 w-6 h-6 rounded-full gradient-primary flex items-center justify-center">
                    <Check className="w-3 h-3 text-primary-foreground" />
                  </div>
                )}
                <div className="text-3xl sm:text-4xl mb-2 sm:mb-3 leading-none">{category.icon}</div>
                <p className={cn(
                  "font-medium font-body text-xs sm:text-sm leading-snug",
                  isSelected ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
                )}>
                  {category.label}
                </p>
              </button>
            );
          })}
        </div>

        {/* Continue Button */}
        <div className="flex justify-center animate-slide-up delay-500">
          <Button
            onClick={handleContinue}
            disabled={isLoading}
            size="lg"
            className="w-full max-w-sm sm:w-auto gradient-primary text-primary-foreground font-body font-medium px-8 min-h-[48px] hover:opacity-90 transition-opacity"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                Saving...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Continue to Dashboard
                <ArrowRight className="w-4 h-4" />
              </span>
            )}
          </Button>
        </div>

        {/* Selection count */}
        <p className="text-center text-sm text-muted-foreground mt-4 font-body">
          {selectedInterests.length} {selectedInterests.length === 1 ? 'interest' : 'interests'} selected
        </p>
      </div>
    </div>
  );
}
