import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ArrowLeft, Copy, Check, Headphones } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { INTEREST_CATEGORIES } from "@/types";
import { firebaseAuth } from "@/lib/firebase";
import { initialsFromEmail } from "@/lib/userDisplay";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [copiedId, setCopiedId] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);

  if (!user) return null;

  const fbUser = firebaseAuth?.currentUser ?? null;
  const photoURL = fbUser?.photoURL ?? undefined;
  const displayName = fbUser?.displayName?.trim() || user.email.split("@")[0] || "User";

  const interestLabels = INTEREST_CATEGORIES.filter((c) => user.interests.includes(c.id)).map(
    (c) => c.label,
  );

  const handleLogout = async () => {
    await logout();
    navigate("/auth", { replace: true });
  };

  const copyUserId = async () => {
    try {
      await navigator.clipboard.writeText(user.id);
      setCopiedId(true);
      toast({ title: "User ID copied", description: "Paste it when contacting support if needed." });
      setTimeout(() => setCopiedId(false), 2000);
    } catch {
      toast({ title: "Could not copy", variant: "destructive" });
    }
  };

  const memberSince = format(
    user.createdAt instanceof Date ? user.createdAt : new Date(user.createdAt),
    "MMMM d, yyyy",
  );

  return (
    <div className="min-h-screen-safe bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50 safe-pt">
        <div className="container max-w-2xl mx-auto safe-px py-3 sm:py-4">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/dashboard")}
              className="font-body shrink-0 h-10 px-2 sm:px-3"
              aria-label="Back to dashboard"
            >
              <ArrowLeft className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Dashboard</span>
            </Button>
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <div className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 rounded-xl gradient-primary flex items-center justify-center">
                <Headphones className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground" />
              </div>
              <h1 className="text-lg sm:text-xl font-display font-bold text-foreground truncate">Profile</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="container max-w-2xl mx-auto safe-px py-6 sm:py-8 safe-pb">
        <Card className="border border-border shadow-sm animate-slide-up">
          <CardHeader className="text-center pb-2 px-4 sm:px-6 pt-6">
            <div className="flex justify-center mb-4">
              <Avatar className="h-24 w-24 sm:h-28 sm:w-28 border-2 border-border">
                {photoURL ? <AvatarImage src={photoURL} alt="" /> : null}
                <AvatarFallback className="bg-primary/15 text-primary font-display text-3xl font-semibold">
                  {initialsFromEmail(user.email)}
                </AvatarFallback>
              </Avatar>
            </div>
            <CardTitle className="font-display text-xl sm:text-2xl">{displayName}</CardTitle>
            <CardDescription className="font-body text-sm break-all pt-1">{user.email}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 px-4 sm:px-6 pb-8">
            <dl className="space-y-4 text-sm font-body">
              <div>
                <dt className="text-muted-foreground mb-1.5">User ID</dt>
                <dd className="flex items-center gap-2">
                  <code className="flex-1 min-w-0 break-all rounded-md bg-muted px-2 py-2 text-xs">
                    {user.id}
                  </code>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="shrink-0 h-10 w-10"
                    onClick={() => void copyUserId()}
                    aria-label="Copy user ID"
                  >
                    {copiedId ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground mb-1">Member since</dt>
                <dd className="text-foreground">{memberSince}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground mb-2">Interests</dt>
                <dd className="flex flex-wrap gap-1.5">
                  {interestLabels.length > 0 ? (
                    interestLabels.map((label) => (
                      <Badge key={label} variant="secondary" className="font-body font-normal">
                        {label}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-muted-foreground">None selected yet</span>
                  )}
                </dd>
              </div>
            </dl>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button variant="outline" className="w-full sm:flex-1 min-h-[48px] sm:min-h-10 font-body" asChild>
                <Link to="/interests">Edit interests</Link>
              </Button>
              <Button
                variant="destructive"
                className="w-full sm:flex-1 min-h-[48px] sm:min-h-10 font-body"
                onClick={() => void handleLogout()}
              >
                Log out
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
