import React, { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Doc } from '../../../convex/_generated/dataModel';
import { toast } from 'sonner';
import LoadingSpinner from '../LoadingSpinner';
import FaceScanSession from './FaceScanSession';
import ManualAttendanceSession from './ManualAttendanceSession';
import { Plus, ArrowLeft, Camera, Edit3, Calendar } from 'lucide-react';

interface AttendanceManagementProps {
  profile: Doc<"userProfiles">;
}

const AttendanceManagement: React.FC<AttendanceManagementProps> = ({ profile }) => {
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [sessionName, setSessionName] = useState('');
  const [attendanceMode, setAttendanceMode] = useState<'manual' | 'face_scan'>('manual');
  const [location, setLocation] = useState('');
  const [showCreateSession, setShowCreateSession] = useState(false);
  const [activeSessionView, setActiveSessionView] = useState<string | null>(null);

  const mySubjects = useQuery(api.subjects.getMySubjects);
  const activeSessions = useQuery(api.attendance.getActiveSessions);
  const createSession = useMutation(api.attendance.createAttendanceSession);
  const endSession = useMutation(api.attendance.endAttendanceSession);

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedSubject || !sessionName.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await createSession({
        subjectId: selectedSubject as any,
        sessionName: sessionName.trim(),
        attendanceMode,
        location: location.trim() || undefined,
      });

      toast.success('Attendance session created successfully!');
      setShowCreateSession(false);
      setSessionName('');
      setLocation('');
      setSelectedSubject('');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create session');
    }
  };

  const handleEndSession = async (sessionId: string) => {
    try {
      await endSession({ sessionId: sessionId as any });
      toast.success('Attendance session ended successfully!');
      setActiveSessionView(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to end session');
    }
  };

  const handleOpenSession = (sessionId: string) => {
    setActiveSessionView(sessionId);
  };

  const handleCloseSessionView = () => {
    setActiveSessionView(null);
  };

  if (mySubjects === undefined || activeSessions === undefined) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  // Find active session being viewed
  const activeSession = activeSessions?.find(session => session._id === activeSessionView);

  // If viewing an active session, show the appropriate interface
  if (activeSession) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {activeSession.sessionName}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {activeSession.subject?.name} ({activeSession.subject?.code})
            </p>
          </div>
          <button
            onClick={handleCloseSessionView}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Sessions</span>
          </button>
        </div>

        {activeSession.attendanceMode === 'face_scan' ? (
          <FaceScanSession session={activeSession} onClose={handleCloseSessionView} />
        ) : (
          <ManualAttendanceSession session={activeSession} onClose={handleCloseSessionView} />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Attendance Management
        </h2>
        <button
          onClick={() => setShowCreateSession(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>New Session</span>
        </button>
      </div>

      {/* Active Sessions */}
      {activeSessions && activeSessions.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Active Sessions
          </h3>
          <div className="space-y-4">
            {activeSessions.map((session) => (
              <div key={session._id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {session.sessionName}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {session.subject?.name} ({session.subject?.code})
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      Started: {new Date(session.startTime).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      session.attendanceMode === 'face_scan'
                        ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
                        : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                    }`}>
                      <div className="flex items-center space-x-1">
                        {session.attendanceMode === 'face_scan' ? (
                          <>
                            <Camera className="w-3 h-3" />
                            <span>Face Scan</span>
                          </>
                        ) : (
                          <>
                            <Edit3 className="w-3 h-3" />
                            <span>Manual</span>
                          </>
                        )}
                      </div>
                    </span>
                    <button
                      onClick={() => handleOpenSession(session._id)}
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm transition-colors"
                    >
                      Open Session
                    </button>
                    <button
                      onClick={() => handleEndSession(session._id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition-colors"
                    >
                      End Session
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Session Modal */}
      {showCreateSession && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Create Attendance Session
            </h3>
            
            <form onSubmit={handleCreateSession} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Subject *
                </label>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                >
                  <option value="">Select a subject</option>
                  {mySubjects.map((subject) => (
                    <option key={subject._id} value={subject._id}>
                      {subject.name} ({subject.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Session Name *
                </label>
                <input
                  type="text"
                  value={sessionName}
                  onChange={(e) => setSessionName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="e.g., Morning Lecture, Lab Session"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Attendance Mode *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setAttendanceMode('manual')}
                    className={`p-3 rounded-lg border-2 transition-colors ${
                      attendanceMode === 'manual'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    <div className="text-center">
                      <Edit3 className="w-6 h-6 mx-auto mb-1" />
                      <span className="text-sm font-medium">Manual</span>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAttendanceMode('face_scan')}
                    className={`p-3 rounded-lg border-2 transition-colors ${
                      attendanceMode === 'face_scan'
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    <div className="text-center">
                      <Camera className="w-6 h-6 mx-auto mb-1" />
                      <span className="text-sm font-medium">Face Scan</span>
                    </div>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="e.g., Room 101, Lab A"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateSession(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Create Session
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* No Active Sessions */}
      {(!activeSessions || activeSessions.length === 0) && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 border border-gray-200 dark:border-gray-700 text-center">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8 text-gray-500 dark:text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No Active Sessions
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Create a new attendance session to start marking attendance for your classes.
          </p>
          <button
            onClick={() => setShowCreateSession(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Create Your First Session
          </button>
        </div>
      )}
    </div>
  );
};

export default AttendanceManagement;
