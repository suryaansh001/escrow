import { Shield, ArrowRight } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  const location = useLocation();
  const isLanding = location.pathname === "/";

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border/50">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary" />
          <span className="font-display font-bold text-lg text-foreground">SecureEscrow</span>
        </Link>

        <div className="flex items-center gap-3">
          {isLanding && (
            <>
              <a href="#how-it-works" className="hidden md:inline text-sm text-muted-foreground hover:text-foreground transition-colors">
                How It Works
              </a>
              <Link to="/login" className="hidden md:inline text-sm text-muted-foreground hover:text-foreground transition-colors ml-4">
                Login
              </Link>
            </>
          )}
          <Button asChild size="sm" className="rounded-xl">
            <Link to="/dashboard">
              Dashboard
              <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
