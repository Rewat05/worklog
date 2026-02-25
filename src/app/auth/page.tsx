"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AuthPage() {
  const supabase = createClient();

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  // 🔐 Login: Email + Password
  const handleLogin = async () => {
    setMessage("Logging in...");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      if (error.message.toLowerCase().includes("invalid login")) {
        setMessage("Invalid email or password.");
      } else if (error.message.toLowerCase().includes("email not confirmed")) {
        setMessage("Please confirm your email before logging in.");
      } else {
        setMessage(error.message);
      }
      return;
    }

    window.location.href = "/dashboard";
  };

  const handleSignup = async () => {
    setMessage("Creating account...");

    // Try to sign up
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      // Clear & user-friendly messages
      if (error.message.toLowerCase().includes("already")) {
        setMessage(
          "An account with this email already exists. Please login instead.",
        );
      } else {
        setMessage(error.message);
      }
      return;
    }

    // Supabase specific case:
    // If user already exists AND email confirmations are enabled,
    // it may still return a user object but not create a new account.
    if (!data.session) {
      setMessage(
        "Account created! Please check your email to confirm your account before logging in.",
      );
    } else {
      setMessage("Signup successful. Redirecting...");
      window.location.href = "/dashboard";
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6 border rounded-2xl p-6 shadow-sm">
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-semibold">Worklog</h1>
          <p className="text-sm text-muted-foreground">
            {isLogin
              ? "Sign in to manage your daily logs"
              : "Create your Worklog account"}
          </p>
        </div>

        <div className="space-y-4">
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Button
            className="w-full"
            onClick={isLogin ? handleLogin : handleSignup}
          >
            {isLogin ? "Sign In" : "Create Account"}
          </Button>
        </div>

        {message && (
          <p className="text-sm text-center text-muted-foreground">{message}</p>
        )}

        <div className="text-center">
          <button
            className="text-sm underline"
            onClick={() => {
              setIsLogin(!isLogin);
              setMessage("");
            }}
          >
            {isLogin
              ? "New user? Create an account"
              : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}
