"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Bookmark, Chrome, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative z-10 w-full max-w-md px-4"
    >
      <Card className="glass-card border-border/30">
        <CardHeader className="text-center space-y-6 pb-2">
          {/* Logo */}
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="mx-auto relative"
          >
            <div className="h-20 w-20 rounded-2xl bg-linear-to-br from-primary to-chart-2 flex items-center justify-center shadow-2xl glow-primary">
              <Bookmark className="h-10 w-10 text-primary-foreground" />
            </div>
            <motion.div
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: 1 }}
              className="absolute -top-1 -right-1"
            >
              <Sparkles className="h-6 w-6 text-chart-3" />
            </motion.div>
          </motion.div>

          <div className="space-y-2">
            <CardTitle className="text-3xl font-bold gradient-text">
              VisualMark
            </CardTitle>
            <CardDescription className="text-base">
              Your visual bookmark manager with stunning previews
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 pt-4">
          {/* Features list */}
          <div className="space-y-3 text-sm text-muted-foreground">
            {[
              "Beautiful masonry grid layouts",
              "Automatic thumbnail extraction",
              "Organize with collections & tags",
              "Share and collaborate",
            ].map((feature, i) => (
              <motion.div
                key={feature}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="flex items-center gap-3"
              >
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                {feature}
              </motion.div>
            ))}
          </div>

          {/* Login button */}
          <Button
            size="lg"
            className="w-full h-12 text-base font-medium shine gap-3"
            onClick={handleGoogleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                <Chrome className="h-5 w-5" />
                Continue with Google
              </>
            )}
          </Button>

          {/* Terms */}
          <p className="text-xs text-center text-muted-foreground">
            By continuing, you agree to our{" "}
            <a href="/terms" className="underline hover:text-foreground transition-colors">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="/privacy" className="underline hover:text-foreground transition-colors">
              Privacy Policy
            </a>
          </p>
        </CardContent>
      </Card>

      {/* Background decorations */}
      <div className="absolute -top-20 -left-20 h-40 w-40 rounded-full bg-primary/20 blur-3xl" />
      <div className="absolute -bottom-20 -right-20 h-40 w-40 rounded-full bg-chart-2/20 blur-3xl" />
    </motion.div>
  );
}
