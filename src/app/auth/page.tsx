"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type AuthError = {
  message?: string;
  status?: number;
  code?: string;
};

function getAuthErrorMessage(error: AuthError) {
  const rawMessage = (error.message ?? "").toLowerCase();
  const rawCode = (error.code ?? "").toLowerCase();

  if (
    rawMessage.includes("user already registered") ||
    rawMessage.includes("already")
  ) {
    return "An account with this email already exists. Please login instead.";
  }

  if (rawMessage.includes("password should be at least")) {
    return "Password must be at least 6 characters.";
  }

  if (rawMessage.includes("signup is disabled") || rawCode === "signup_disabled") {
    return "Email signup is disabled in Supabase Auth settings.";
  }

  if (rawMessage.includes("email not confirmed")) {
    return "Email confirmation is enabled in Supabase. Disable Confirm email in Auth settings to allow direct signup/login.";
  }

  if (error.status === 422) {
    return "Signup request is invalid. Check email format and password length.";
  }

  if (rawMessage.includes("captcha")) {
    return "Signup is blocked by CAPTCHA settings in Supabase. Disable CAPTCHA or provide a CAPTCHA token.";
  }

  if (rawMessage.includes("database error saving new user")) {
    return "Supabase could not save the new user. Check Auth logs for database trigger/function errors.";
  }

  if (error.status === 400) {
    return (
      (error.message && error.message.trim()) ||
      "Signup failed (400). Check Supabase Auth settings: Email provider enabled, Email signup enabled, and Confirm email disabled."
    );
  }

  return (error.message && error.message.trim()) || "Authentication failed. Please try again.";
}

export default function AuthPage() {
  const supabase = createClient();

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = async () => {
    setMessage("Logging in...");

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      if (error.message.toLowerCase().includes("invalid login")) {
        setMessage("Invalid email or password.");
      } else {
        setMessage(getAuthErrorMessage(error));
      }
      return;
    }

    window.location.href = "/dashboard";
  };

  const handleSignup = async () => {
    setMessage("Creating account...");

    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
    });

    if (error) {
      console.error("Supabase signUp error:", {
        message: error.message,
        status: error.status,
        code: error.code,
      });
      setMessage(getAuthErrorMessage(error));
      return;
    }

    const { error: loginError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (loginError) {
      setMessage(getAuthErrorMessage(loginError));
      return;
    }

    setMessage("Signup successful. Redirecting...");
    window.location.href = "/dashboard";
  };

  const onAuthAction = async () => {
    const normalizedEmail = email.trim();

    if (!normalizedEmail || !password) {
      setMessage("Email and password are required.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      setMessage("Please enter a valid email address.");
      return;
    }

    if (password.length < 6) {
      setMessage("Password must be at least 6 characters.");
      return;
    }

    if (isLogin) {
      await handleLogin();
      return;
    }

    await handleSignup();
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
            onClick={onAuthAction}
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
