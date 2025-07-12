import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { Authenticated, Unauthenticated } from "convex/react";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import LoadingWrapper from "./components/LoadingWrapper";
import ProfileSetup from "./components/ProfileSetup";
import Dashboard from "./components/Dashboard";
import { NotificationProvider } from "./components/common/NotificationSystem";

function App() {
  return (
    <NotificationProvider>
      <main className="min-h-screen bg-gray-900">
        <Unauthenticated>
          <SignInForm />
        </Unauthenticated>
        <Authenticated>
          <LoadingWrapper isLoading={false}>
            <AuthenticatedApp />
          </LoadingWrapper>
        </Authenticated>
      </main>
    </NotificationProvider>
  );
}

function AuthenticatedApp() {
  const user = useQuery(api.auth.loggedInUser);
  const userProfile = useQuery(api.userProfiles.getCurrentUserProfile);

  if (user === undefined || userProfile === undefined) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!userProfile) {
    return <ProfileSetup />;
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="flex justify-between items-center p-4 bg-gray-800 border-b border-gray-700">
        <h1 className="text-2xl font-bold text-white">
          Welcome, {userProfile.name}!
        </h1>
        <SignOutButton />
      </div>
      <Dashboard />
    </div>
  );
}

export default App;
