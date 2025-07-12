"use client";
import { useAuthActions } from "@convex-dev/auth/react";
import { useState, useEffect } from "react";
import { useNotify } from "./components/common/NotificationSystem";

export function SignInForm() {
  const { signIn } = useAuthActions();
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const notify = useNotify();

  // Initialize Google Sign-In
  useEffect(() => {
    // Google Sign-In initialization would go here
    // Currently simplified for demo purposes
  }, []);





  const handleGoogleSignIn = async () => {
    setSubmitting(true);
    try {
      await signIn("google");
      notify.success("Success", "Successfully signed in with Google!");
    } catch (error) {
      console.error("Google sign-in error:", error);
      notify.error("Sign In Failed", "Failed to sign in with Google. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full space-y-6 max-w-md mx-auto">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">🎓</span>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {flow === "signIn" ? "Welcome back!" : "Create your account"}
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          {flow === "signIn" 
            ? "Sign in to access your attendance dashboard" 
            : "Join Attendify to manage attendance efficiently"
          }
        </p>
      </div>

      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          setSubmitting(true);
          const formData = new FormData(e.target as HTMLFormElement);
          formData.set("flow", flow);
          void signIn("password", formData).catch((error) => {
            let toastTitle = "";
            if (error.message.includes("Invalid password")) {
              toastTitle = "Invalid password. Please try again.";
            } else {
              toastTitle =
                flow === "signIn"
                  ? "Could not sign in, did you mean to sign up?"
                  : "Could not sign up, did you mean to sign in?";
            }
            notify.error("Sign In Error", toastTitle);
            setSubmitting(false);
          });
        }}
      >
        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="Enter your email"
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
          />
        </div>
        <div className="relative">
          <input
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            required
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            {showPassword ? "🙈" : "👁️"}
          </button>
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-medium transition-all duration-200 disabled:opacity-50 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          {submitting ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Loading...</span>
            </div>
          ) : (
            <span>{flow === "signIn" ? "🚀 Sign in" : "✨ Sign up"}</span>
          )}
        </button>
        <div className="text-center">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {flow === "signIn"
              ? "Don't have an account? "
              : "Already have an account? "}
          </span>
          <button
            type="button"
            className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 transition-colors"
            onClick={() => setFlow(flow === "signIn" ? "signUp" : "signIn")}
          >
            {flow === "signIn" ? "Sign up here" : "Sign in instead"}
          </button>
        </div>
      </form>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300 dark:border-gray-600" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-6 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 font-medium">
            Or continue with
          </span>
        </div>
      </div>
      <div className="space-y-3">
        <button
          onClick={handleGoogleSignIn}
          disabled={submitting}
          className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-blue-300 dark:hover:border-blue-500 transition-all duration-300 font-semibold flex items-center justify-center space-x-3 disabled:opacity-50 shadow-lg hover:shadow-xl transform hover:-translate-y-1 hover:scale-[1.02] group"
        >
          {submitting ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
          ) : (
            <svg className="w-6 h-6" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          )}
          <span>{submitting ? "Signing in..." : "Continue with Google"}</span>
        </button>
        <button
          onClick={() => void signIn("anonymous")}
          className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 text-gray-700 dark:text-gray-300 hover:from-gray-100 hover:to-gray-200 dark:hover:from-gray-700 dark:hover:to-gray-600 hover:border-purple-300 dark:hover:border-purple-500 transition-all duration-300 font-semibold flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl transform hover:-translate-y-1 hover:scale-[1.02]"
        >
          <span className="text-xl">👤</span>
          <span>Continue as Guest</span>
        </button>
      </div>

      <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 text-center">
          ✨ What you'll get with Attendify
        </h3>
        <div className="grid grid-cols-1 gap-3 text-sm">
          <div className="flex items-center text-gray-600 dark:text-gray-400">
            <span className="mr-3 text-green-500">✅</span>
            Smart face recognition attendance
          </div>
          <div className="flex items-center text-gray-600 dark:text-gray-400">
            <span className="mr-3 text-green-500">✅</span>
            Real-time attendance tracking
          </div>
          <div className="flex items-center text-gray-600 dark:text-gray-400">
            <span className="mr-3 text-green-500">✅</span>
            Comprehensive reporting dashboard
          </div>
        </div>
      </div>
    </div>
  );
}
