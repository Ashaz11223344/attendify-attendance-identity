import React, { useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import LoadingSpinner from './LoadingSpinner';
import AdminDashboard from './dashboards/AdminDashboard';
import TeacherDashboard from './dashboards/TeacherDashboard';
import StudentDashboard from './dashboards/StudentDashboard';
import AccountSettings from './AccountSettings';
import ProfilePicture from './common/ProfilePicture';

import { Clock, ArrowLeft, Settings } from 'lucide-react';

const Dashboard: React.FC = () => {
  const profile = useQuery(api.userProfiles.getCurrentUserProfile);
  const [activeTab, setActiveTab] = useState('overview');
  const [showAccountSettings, setShowAccountSettings] = useState(false);

  if (profile === undefined) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <LoadingSpinner />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Profile Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Please contact support for assistance.
          </p>
        </div>
      </div>
    );
  }

  if (profile.status !== 'approved') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700 text-center">
          <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Profile Under Review
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {profile.status === 'pending' 
              ? "Your profile is being reviewed by an administrator. You'll receive a notification once it's approved."
              : "Your profile has been rejected. Please contact an administrator for more information."
            }
          </p>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Status:</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                profile.status === 'pending'
                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                  : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
              }`}>
                {profile.status}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-center">
            {/* Status display only */}
          </div>
        </div>
      </div>
    );
  }

  if (showAccountSettings) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <button
                onClick={() => setShowAccountSettings(false)}
                className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Dashboard</span>
              </button>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3">
                  <ProfilePicture
                    storageId={profile.profilePicture}
                    name={profile.name}
                    size={32}
                  />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {profile.name}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <AccountSettings />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                {profile.role === 'admin' ? 'Admin Dashboard' : 
                 profile.role === 'teacher' ? 'Teacher Dashboard' : 
                 'Student Dashboard'}
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowAccountSettings(true)}
                className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <ProfilePicture
                  storageId={profile.profilePicture}
                  name={profile.name}
                  size={32}
                />
                <span className="text-sm font-medium">
                  {profile.name}
                </span>
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {profile.role === 'admin' && (
          <AdminDashboard 
            profile={profile} 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
          />
        )}
        {profile.role === 'teacher' && (
          <TeacherDashboard 
            profile={profile} 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
          />
        )}
        {profile.role === 'student' && (
          <StudentDashboard 
            profile={profile} 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
          />
        )}
      </main>
    </div>
  );
};

export default Dashboard;
