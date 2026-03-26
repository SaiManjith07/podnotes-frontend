import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen-safe items-center justify-center bg-muted safe-px py-10 safe-pb">
      <div className="text-center max-w-sm px-4">
        <h1 className="mb-3 text-5xl sm:text-4xl font-display font-bold text-foreground">404</h1>
        <p className="mb-6 text-base sm:text-lg text-muted-foreground font-body">Oops! Page not found</p>
        <a href="/" className="inline-flex min-h-[44px] items-center justify-center text-primary font-body font-medium underline underline-offset-4 hover:text-primary/90">
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
