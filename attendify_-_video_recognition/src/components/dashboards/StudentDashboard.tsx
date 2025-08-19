import React, { useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Doc } from '../../../convex/_generated/dataModel';
import LoadingWrapper from '../LoadingWrapper';
import MySubjects from '../student/MySubjects';
import AttendanceHistory from '../student/AttendanceHistory';
import LeaveRequestHistory from '../student/LeaveRequestHistory';
import FaceDataSetup from '../student/FaceDataSetup';
import DetailedReport from '../common/DetailedReport';
import Leaderboard from '../common/Leaderboard';
import NotificationShowcase from '../common/NotificationShowcase';
import DownloadAppButton from '../common/DownloadAppButton';
import { BookOpen, Calendar, FileText, Camera, BarChart3, Trophy, Bell } from 'lucide-react';

interface StudentDashboardProps {
  profile: Doc<"userProfiles">;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const StudentDashboard: React.FC<StudentDashboardProps> = ({ profile, activeTab, setActiveTab }) => {
  const mySubjects = useQuery(api.subjects.getMySubjects);
  const myAttendance = useQuery(api.attendance.getStudentAttendance, {});
  const myLeaveRequests = useQuery(api.leaveRequests.getMyLeaveRequests, {});

  const tabs = [
    { id: 'overview', name: 'Overview', icon: BarChart3 },
    { id: 'subjects', name: 'My Subjects', icon: BookOpen },
    { id: 'attendance', name: 'Attendance History', icon: Calendar },
    { id: 'leave-requests', name: 'Leave Requests', icon: FileText },
    { id: 'face-setup', name: 'Face Recognition', icon: Camera },
    { id: 'detailed-report', name: 'My Reports', icon: BarChart3 },
    { id: 'leaderboard', name: 'Leaderboard', icon: Trophy },
    { id: 'notifications', name: 'Notifications', icon: Bell },
  ];

  const calculateAttendancePercentage = () => {
    if (!myAttendance || myAttendance.length === 0) return 0;
    const presentCount = myAttendance.filter(record => record.status === 'present').length;
    return Math.round((presentCount / myAttendance.length) * 100);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Stats Cards */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Enrolled Subjects</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {mySubjects?.length || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Attendance Rate</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {calculateAttendancePercentage()}%
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Leave Requests</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {myLeaveRequests?.length || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                  <FileText className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="md:col-span-2 lg:col-span-3 bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Recent Attendance
              </h3>
              {myAttendance && myAttendance.length > 0 ? (
                <div className="space-y-3">
                  {myAttendance.slice(0, 5).map((record: any) => (
                    <div
                      key={record._id}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {record.session?.sessionName || 'Attendance Session'}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {record.subject?.name} • {new Date(record.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        record.status === 'present'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                          : record.status === 'absent'
                          ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                      }`}>
                        {record.status}
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
                    No Attendance Records
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Your attendance records will appear here once teachers start taking attendance.
                  </p>
                </div>
              )}
            </div>
          </div>
        );

      case 'subjects':
        return <MySubjects profile={profile} />;

      case 'attendance':
        return <AttendanceHistory profile={profile} />;

      case 'leave-requests':
        return <LeaveRequestHistory />;

      case 'face-setup':
        return <FaceDataSetup profile={profile} onComplete={() => {}} />;

      case 'detailed-report':
        return <DetailedReport profile={profile} userRole="student" />;

      case 'leaderboard':
        return <Leaderboard profile={profile} userRole="student" />;

      case 'notifications':
        return <NotificationShowcase />;

      default:
        return null;
    }
  };

  return (
    <LoadingWrapper isLoading={mySubjects === undefined || myAttendance === undefined}>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Student Dashboard</h2>
              <p className="text-blue-100">
                Track your attendance, manage subjects, and view your academic progress
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
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
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

export default StudentDashboard;
