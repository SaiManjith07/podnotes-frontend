import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { INTEREST_CATEGORIES } from '@/types';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { ArrowRight, Check, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

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

  const toggleInterest = (id: string) => {
    setSelectedInterests(prev => 
      prev.includes(id) 
        ? prev.filter(i => i !== id)
        : [...prev, id]
    );
  };

  const handleContinue = () => {
    if (selectedInterests.length < 1) {
      toast({
        title: "Select at least one interest",
        description: "This helps us personalize your experience",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    updateInterests(selectedInterests);
    
    toast({
      title: "Interests saved!",
      description: "Your feed will be personalized based on your choices",
    });
    
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen gradient-warm relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-64 h-64 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-20 left-10 w-80 h-80 rounded-full bg-accent/5 blur-3xl" />
      </div>

      <div className="container max-w-4xl mx-auto px-4 py-12 relative z-10">
        {/* Header */}
        <div className="text-center mb-12 animate-slide-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium font-body">Personalize your experience</span>
          </div>
          <h1 className="text-4xl font-display font-bold text-foreground mb-4">
            What interests you?
          </h1>
          <p className="text-lg text-muted-foreground font-body max-w-md mx-auto">
            Select topics you're passionate about. We'll use this to curate your podcast notes.
          </p>
        </div>

        {/* Interest Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-12">
          {INTEREST_CATEGORIES.map((category, index) => {
            const isSelected = selectedInterests.includes(category.id);
            return (
              <button
                key={category.id}
                onClick={() => toggleInterest(category.id)}
                className={cn(
                  "relative p-6 rounded-2xl border-2 transition-all duration-200 animate-slide-up group",
                  "hover:scale-105 hover:shadow-lg",
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
                <div className="text-4xl mb-3">{category.icon}</div>
                <p className={cn(
                  "font-medium font-body text-sm",
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
            className="gradient-primary text-primary-foreground font-body font-medium px-8 hover:opacity-90 transition-opacity"
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
