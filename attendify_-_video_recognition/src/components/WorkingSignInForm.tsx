"use client";
import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";
import { toast } from "sonner";
import { GraduationCap, Eye, EyeOff, Rocket, Sparkles, User, Info, CheckCircle } from "lucide-react";

export function AuthForm() {
  const { signIn } = useAuthActions();
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="w-full space-y-6 max-w-md mx-auto">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <GraduationCap className="w-8 h-8 text-white" />
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
            toast.error(toastTitle);
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
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
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
            <div className="flex items-center space-x-2">
              {flow === "signIn" ? <Rocket className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
              <span>{flow === "signIn" ? "Sign in" : "Sign up"}</span>
            </div>
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
            Or continue as
          </span>
        </div>
      </div>
      
      <div className="space-y-3">
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900/40 rounded-full flex items-center justify-center">
              <Info className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
                Google Sign-In Coming Soon
              </h4>
              <p className="text-xs text-yellow-700 dark:text-yellow-400 mt-1">
                Google OAuth will be available in future updates. For now, use email/password or guest access.
              </p>
            </div>
          </div>
        </div>
        
        <button
          onClick={() => void signIn("anonymous")}
          disabled={submitting}
          className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 text-gray-700 dark:text-gray-300 hover:from-gray-100 hover:to-gray-200 dark:hover:from-gray-700 dark:hover:to-gray-600 hover:border-purple-300 dark:hover:border-purple-500 transition-all duration-300 font-semibold flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl transform hover:-translate-y-1 hover:scale-[1.02]"
        >
          <User className="w-5 h-5" />
          <span>Continue as Guest</span>
        </button>
      </div>

      <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-center space-x-2 mb-3">
          <Sparkles className="w-4 h-4 text-blue-400" />
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white text-center">
            What you'll get with Attendify
          </h3>
        </div>
        <div className="grid grid-cols-1 gap-3 text-sm">
          <div className="flex items-center text-gray-600 dark:text-gray-400">
            <CheckCircle className="w-4 h-4 mr-3 text-green-500" />
            Smart face recognition attendance
          </div>
          <div className="flex items-center text-gray-600 dark:text-gray-400">
            <CheckCircle className="w-4 h-4 mr-3 text-green-500" />
            Real-time attendance tracking
          </div>
          <div className="flex items-center text-gray-600 dark:text-gray-400">
            <CheckCircle className="w-4 h-4 mr-3 text-green-500" />
            Comprehensive reporting dashboard
          </div>
        </div>
      </div>
    </div>
  );
}
