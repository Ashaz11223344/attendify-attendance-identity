import React, { useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Doc } from '../../../convex/_generated/dataModel';
import LoadingSpinner from '../LoadingSpinner';
import SubjectOverview from './SubjectOverview';
import StudentManagement from './StudentManagement';
import AttendanceManagement from './AttendanceManagement';
import AutoFaceScanSession from './AutoFaceScanSession';
import ManualAttendanceSession from './ManualAttendanceSession';
import { Id } from '../../../convex/_generated/dataModel';

interface TeacherDashboardProps {
  profile: Doc<"userProfiles">;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ profile, activeTab, setActiveTab }) => {
  const [activeFaceScanSession, setActiveFaceScanSession] = useState<Id<"attendanceSessions"> | null>(null);
  const [activeManualSession, setActiveManualSession] = useState<Doc<"attendanceSessions"> | null>(null);

  const teacherSubjects = useQuery(api.subjects.getMySubjects);
  const recentSessions = useQuery(api.attendance.getActiveSessions);

  const tabs = [
    { id: 'overview', name: 'Overview', icon: '📊' },
    { id: 'subjects', name: 'My Subjects', icon: '📚' },
    { id: 'students', name: 'Student Management', icon: '👥' },
    { id: 'attendance', name: 'Attendance', icon: '✅' },
  ];

  const handleStartFaceScan = (sessionId: Id<"attendanceSessions">) => {
    setActiveFaceScanSession(sessionId);
  };

  const handleStartManualSession = (sessionId: Id<"attendanceSessions">) => {
    const session = recentSessions?.find(s => s._id === sessionId);
    if (session) {
      setActiveManualSession(session);
    }
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
                  <p className="text-sm text-gray-600 dark:text-gray-400">My Subjects</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {teacherSubjects?.length || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 dark:text-blue-400 text-xl">📚</span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Students</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {teacherSubjects?.reduce((total: number, subject: any) => total + (subject.enrolledCount || 0), 0) || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <span className="text-green-600 dark:text-green-400 text-xl">👥</span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Recent Sessions</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {recentSessions?.length || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                  <span className="text-purple-600 dark:text-purple-400 text-xl">📅</span>
                </div>
              </div>
            </div>

            {/* Recent Sessions */}
            <div className="md:col-span-2 lg:col-span-3 bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Recent Attendance Sessions
              </h3>
              {recentSessions && recentSessions.length > 0 ? (
                <div className="space-y-3">
                  {recentSessions?.slice(0, 5).map((session: any) => (
                    <div
                      key={session._id}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {session.subject?.name}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {new Date(session.date).toLocaleDateString()} • {session.status}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {session.presentCount || 0} present
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          session.status === 'active'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
                        }`}>
                          {session.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">📅</span>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No Recent Sessions
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Start taking attendance to see your sessions here.
                  </p>
                </div>
              )}
            </div>
          </div>
        );

      case 'subjects':
        return <SubjectOverview profile={profile} />;

      case 'students':
        return <StudentManagement profile={profile} />;

      case 'attendance':
        return <AttendanceManagement profile={profile} />;

      default:
        return null;
    }
  };

  if (teacherSubjects === undefined || recentSessions === undefined) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Face Scan Session Modal */}
      {activeFaceScanSession && (
        <AutoFaceScanSession
          sessionId={activeFaceScanSession}
          onClose={() => setActiveFaceScanSession(null)}
        />
      )}

      {/* Manual Session Modal */}
      {activeManualSession && (
        <ManualAttendanceSession
          session={activeManualSession}
          onClose={() => setActiveManualSession(null)}
        />
      )}

      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-blue-600 rounded-xl p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Teacher Dashboard</h2>
        <p className="text-purple-100">
          Manage your subjects, students, and attendance sessions
        </p>
        <div className="mt-3 bg-purple-600/30 rounded-lg p-3 border border-purple-400/30">
          <p className="text-sm text-purple-100">
            🎯 <strong>Auto Recognition:</strong> New face scanning automatically recognizes students with 93%+ confidence and marks them present. No manual clicking required!
          </p>
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
              <span>{tab.icon}</span>
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
  );
};

export default TeacherDashboard;
