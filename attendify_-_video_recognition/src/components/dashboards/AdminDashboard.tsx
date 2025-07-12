import React, { useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Doc } from '../../../convex/_generated/dataModel';
import LoadingWrapper from '../LoadingWrapper';
import SubjectManagement from '../admin/SubjectManagement';
import StudentEnrollment from '../admin/StudentEnrollment';
import EmailManagement from '../admin/EmailManagement';
import ReportsManagement from '../admin/ReportsManagement';
import UserManagement from '../admin/UserManagement';
import DetailedReport from '../common/DetailedReport';
import Leaderboard from '../common/Leaderboard';
import NotificationShowcase from '../common/NotificationShowcase';
import { BarChart3, Users, BookOpen, FileText, TrendingUp, Mail, GraduationCap, UserCheck, Calendar, Trophy, Bell } from 'lucide-react';

interface AdminDashboardProps {
  profile: Doc<"userProfiles">;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ profile, activeTab, setActiveTab }) => {
  const allProfiles = useQuery(api.userProfiles.getAllProfiles, {});
  const allSubjects = useQuery(api.subjects.getAllSubjects);
  const recentSessions = useQuery(api.attendance.getRecentSessions);

  const tabs = [
    { id: 'overview', name: 'Overview', icon: BarChart3 },
    { id: 'profiles', name: 'User Management', icon: Users },
    { id: 'subjects', name: 'Subject Management', icon: BookOpen },
    { id: 'enrollment', name: 'Student Enrollment', icon: FileText },
    { id: 'detailed-report', name: 'System Reports', icon: TrendingUp },
    { id: 'leaderboard', name: 'Global Leaderboard', icon: Trophy },
    { id: 'reports', name: 'Analytics', icon: BarChart3 },
    { id: 'email', name: 'Email Management', icon: Mail },
    { id: 'notifications', name: 'Notification Demo', icon: Bell },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Stats Cards */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {allProfiles?.length || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Active Subjects</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {allSubjects?.filter(s => s.isActive).length || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Students</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {allProfiles?.filter(p => p.role === 'student' && p.status === 'approved').length || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                  <GraduationCap className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Teachers</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {allProfiles?.filter(p => p.role === 'teacher' && p.status === 'approved').length || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
                  <UserCheck className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="md:col-span-2 lg:col-span-4 bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Recent Attendance Sessions
              </h3>
              {recentSessions && recentSessions.length > 0 ? (
                <div className="space-y-3">
                  {recentSessions.slice(0, 5).map((session: any) => (
                    <div
                      key={session._id}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {session.sessionName}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {session.subject?.name} • {new Date(session.date).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        session.status === 'active'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
                      }`}>
                        {session.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar className="w-8 h-8 text-gray-500 dark:text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No Recent Sessions
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Attendance sessions will appear here once teachers start taking attendance.
                  </p>
                </div>
              )}
            </div>
          </div>
        );

      case 'profiles':
        return <UserManagement profile={profile} />;

      case 'subjects':
        return <SubjectManagement profile={profile} />;

      case 'enrollment':
        return <StudentEnrollment />;

      case 'detailed-report':
        return <DetailedReport profile={profile} userRole="admin" />;

      case 'leaderboard':
        return <Leaderboard profile={profile} userRole="admin" />;

      case 'reports':
        return <ReportsManagement profile={profile} />;

      case 'email':
        return <EmailManagement />;

      case 'notifications':
        return <NotificationShowcase />;

      default:
        return null;
    }
  };

  return (
    <LoadingWrapper isLoading={allProfiles === undefined || allSubjects === undefined}>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-500 to-pink-600 rounded-xl p-6 text-white">
          <h2 className="text-2xl font-bold mb-2">Admin Dashboard</h2>
          <p className="text-red-100">
            Manage users, subjects, enrollments, and system settings
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-red-500 text-red-600 dark:text-red-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          {renderTabContent()}
        </div>
      </div>
    </LoadingWrapper>
  );
};

export default AdminDashboard;
