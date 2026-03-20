"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Zap } from "lucide-react";
import { cn } from "@/lib/utils";

export function LandingNav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    onScroll(); // check on mount
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="fixed top-0 z-50 w-full px-4 pt-3 md:px-6">
      <div
        className={cn(
          "mx-auto flex h-14 max-w-6xl items-center justify-between rounded-2xl px-5 transition-all duration-500 ease-out md:px-6",
          scrolled
            ? "bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-900 shadow-lg shadow-slate-900/20"
            : "bg-transparent shadow-none"
        )}
      >
        <div className="flex items-center gap-2">
          <Zap
            className={cn(
              "h-5 w-5 transition-colors duration-500",
              scrolled ? "text-emerald-400" : "text-emerald-600"
            )}
          />
          <span
            className={cn(
              "text-lg font-bold transition-colors duration-500",
              scrolled ? "text-white" : "text-slate-900 dark:text-white"
            )}
          >
            Operon
          </span>
        </div>
        <nav className="hidden items-center gap-8 md:flex">
          {[
            { href: "#features", label: "Features" },
            { href: "#how-it-works", label: "How It Works" },
            { href: "#faq", label: "FAQ" },
          ].map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm transition-colors duration-500",
                scrolled
                  ? "text-slate-300 hover:text-white"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              )}
            >
              {link.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <a
            href="https://www.youtube.com/watch?v=tFc8AvYqPX0"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "transition-colors duration-500",
                scrolled
                  ? "text-slate-300 hover:bg-white/10 hover:text-white"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white"
              )}
            >
              Demo Video
            </Button>
          </a>
          <Link href="/login">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "transition-colors duration-500",
                scrolled
                  ? "text-slate-300 hover:bg-white/10 hover:text-white"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white"
              )}
            >
              Log in
            </Button>
          </Link>
          <Link href="/signup">
            <Button
              size="sm"
              className={cn(
                "rounded-lg transition-all duration-500",
                scrolled
                  ? "bg-emerald-500 text-white hover:bg-emerald-400 hover:shadow-lg hover:shadow-emerald-500/25"
                  : "bg-emerald-600 text-white hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-600/25"
              )}
            >
              Get Started Free
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
