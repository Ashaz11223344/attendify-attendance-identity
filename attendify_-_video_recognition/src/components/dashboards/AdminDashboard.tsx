import React, { useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Doc } from '../../../convex/_generated/dataModel';
import LoadingWrapper from '../LoadingWrapper';
import UserManagement from '../admin/UserManagement';
import SubjectManagement from '../admin/SubjectManagement';
import StudentEnrollment from '../admin/StudentEnrollment';
import EmailManagement from '../admin/EmailManagement';
import ReportsManagement from '../admin/ReportsManagement';
import DetailedReport from '../common/DetailedReport';
import Leaderboard from '../common/Leaderboard';
import NotificationShowcase from '../common/NotificationShowcase';
import DownloadAppButton from '../common/DownloadAppButton';
import { Users, BookOpen, UserPlus, Mail, BarChart3, Trophy, Bell, Shield } from 'lucide-react';

interface AdminDashboardProps {
  profile: Doc<"userProfiles">;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ profile, activeTab, setActiveTab }) => {
  const allUsers = useQuery(api.userProfiles.getAllUsers, {});
  const allSubjects = useQuery(api.subjects.getAllSubjects, {});
  const recentSessions = useQuery(api.attendance.getRecentSessions);

  const tabs = [
    { id: 'overview', name: 'Overview', icon: Shield },
    { id: 'users', name: 'User Management', icon: Users },
    { id: 'subjects', name: 'Subject Management', icon: BookOpen },
    { id: 'enrollment', name: 'Student Enrollment', icon: UserPlus },
    { id: 'email', name: 'Email Management', icon: Mail },
    { id: 'reports', name: 'Reports', icon: BarChart3 },
    { id: 'detailed-report', name: 'Detailed Reports', icon: BarChart3 },
    { id: 'leaderboard', name: 'Leaderboard', icon: Trophy },
    { id: 'notifications', name: 'Notifications', icon: Bell },
  ];

  const getStats = () => {
    const students = allUsers?.filter(user => user.role === 'student') || [];
    const teachers = allUsers?.filter(user => user.role === 'teacher') || [];
    const admins = allUsers?.filter(user => user.role === 'admin') || [];
    
    return {
      totalUsers: allUsers?.length || 0,
      students: students.length,
      teachers: teachers.length,
      admins: admins.length,
      subjects: allSubjects?.length || 0,
      recentSessions: recentSessions?.length || 0,
    };
  };

  const stats = getStats();

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
                    {stats.totalUsers}
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
                  <p className="text-sm text-gray-600 dark:text-gray-400">Students</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.students}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Teachers</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.teachers}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Subjects</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.subjects}
                  </p>
                </div>
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="md:col-span-2 lg:col-span-4 bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                System Overview
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3">User Distribution</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Students</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{stats.students}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Teachers</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{stats.teachers}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Admins</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{stats.admins}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3">System Activity</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Total Subjects</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{stats.subjects}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Recent Sessions</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{stats.recentSessions}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">System Status</span>
                      <span className="text-sm font-medium text-green-600 dark:text-green-400">Active</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'users':
        return <UserManagement profile={profile} />;

      case 'subjects':
        return <SubjectManagement profile={profile} />;

      case 'enrollment':
        return <StudentEnrollment />;

      case 'email':
        return <EmailManagement />;

      case 'reports':
        return <ReportsManagement profile={profile} />;

      case 'detailed-report':
        return <DetailedReport profile={profile} userRole="admin" />;

      case 'leaderboard':
        return <Leaderboard profile={profile} userRole="admin" />;

      case 'notifications':
        return <NotificationShowcase />;

      default:
        return null;
    }
  };

  return (
    <LoadingWrapper isLoading={allUsers === undefined || allSubjects === undefined}>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Admin Dashboard</h2>
              <p className="text-purple-100">
                Manage users, subjects, and system-wide settings
              </p>
            </div>
            <div className="flex-shrink-0">
              <DownloadAppButton />
            </div>
          </div>
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
                    ? 'border-purple-500 text-purple-600 dark:text-purple-400'
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
