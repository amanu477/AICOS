import { Link } from "wouter";
import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Hexagon } from "lucide-react";
import { motion } from "framer-motion";

export function Navbar() {
  const { theme, setTheme } = useTheme();

  return (
    <motion.header 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60"
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 group">
          <Hexagon className="h-6 w-6 text-primary group-hover:text-primary/80 transition-colors" />
          <span className="font-semibold text-lg tracking-tight">AICOS</span>
        </Link>
        
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
          {[
            { label: "Features", id: "features" },
            { label: "How it Works", id: "how-it-works" },
            { label: "Pricing", id: "pricing" },
            { label: "FAQ", id: "faq" },
          ].map(({ label, id }) => (
            <button
              key={id}
              onClick={() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" })}
              className="hover:text-foreground transition-colors cursor-pointer bg-transparent border-0 p-0 font-medium text-sm text-muted-foreground"
            >
              {label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            data-testid="button-theme-toggle"
            className="h-9 w-9"
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
          
          <div className="hidden sm:flex items-center gap-2">
            <Link href="/sign-in">
              <Button variant="ghost" data-testid="button-login">Log in</Button>
            </Link>
            <Link href="/sign-up">
              <Button data-testid="button-start-trial">Start Free Trial</Button>
            </Link>
          </div>
        </div>
      </div>
    </motion.header>
  );
}