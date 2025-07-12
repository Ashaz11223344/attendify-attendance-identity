import React from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { LogOut } from "lucide-react";

export function WorkingSignOutButton() {
  const { signOut } = useAuthActions();
  return (
    <button
      className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors font-medium"
      onClick={() => void signOut()}
    >
      <LogOut className="w-4 h-4" />
      <span>Sign out</span>
    </button>
  );
}
