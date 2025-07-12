import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Doc } from '../../../convex/_generated/dataModel';
import { toast } from 'sonner';
import LoadingSpinner from '../LoadingSpinner';

interface ManualAttendanceSessionProps {
  session: Doc<"attendanceSessions">;
  onClose: () => void;
}

type AttendanceStatus = 'present' | 'late' | 'on_leave';

interface StudentAttendance {
  studentId: string;
  status: AttendanceStatus | null;
  timestamp?: number;
}

const ManualAttendanceSession: React.FC<ManualAttendanceSessionProps> = ({ session, onClose }) => {
  const [studentAttendance, setStudentAttendance] = useState<Record<string, StudentAttendance>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<AttendanceStatus>('present');
  const [isSaving, setIsSaving] = useState(false);

  const enrolledStudents = useQuery(api.subjects.getEnrolledStudents, { 
    subjectId: session.subjectId 
  });
  const markAttendance = useMutation(api.attendance.markManualAttendance);
  
  // Get subject data (session should have it but TypeScript doesn't know)
  const sessionWithSubject = session as any;

  // Initialize student attendance state
  useEffect(() => {
    if (enrolledStudents) {
      const initialState: Record<string, StudentAttendance> = {};
      enrolledStudents.forEach(student => {
        initialState[student._id] = {
          studentId: student._id,
          status: null,
        };
      });
      setStudentAttendance(initialState);
    }
  }, [enrolledStudents]);

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setStudentAttendance(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status,
        timestamp: Date.now(),
      },
    }));
    
    // Show immediate feedback
    const student = enrolledStudents?.find(s => s._id === studentId);
    if (student) {
      const statusText = status === 'present' ? 'Present' : status === 'late' ? 'Late' : 'On Leave';
      toast.success(`${student.name} marked as ${statusText}`);
    }
  };

  const handleSaveAttendance = async () => {
    setIsSaving(true);
    
    try {
      const attendanceRecords = Object.values(studentAttendance).filter(record => record.status !== null);
      
      if (attendanceRecords.length === 0) {
        toast.error('Please mark attendance for at least one student');
        return;
      }

      for (const record of attendanceRecords) {
        await markAttendance({
          sessionId: session._id,
          studentId: record.studentId as any,
          status: record.status === "on_leave" ? "absent" : record.status!,
          notes: undefined,
        });
      }

      toast.success(`Attendance saved for ${attendanceRecords.length} students`);
      onClose();
    } catch (error) {
      toast.error('Failed to save attendance');
      console.error('Save attendance error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const getStatusColor = (status: AttendanceStatus) => {
    switch (status) {
      case 'present':
        return 'bg-green-500 hover:bg-green-600 text-white';
      case 'late':
        return 'bg-orange-500 hover:bg-orange-600 text-white';
      case 'on_leave':
        return 'bg-red-500 hover:bg-red-600 text-white';
      default:
        return 'bg-gray-200 hover:bg-gray-300 text-gray-700';
    }
  };

  const getStatusIcon = (status: AttendanceStatus) => {
    switch (status) {
      case 'present':
        return '✅';
      case 'late':
        return '⏰';
      case 'on_leave':
        return '🏠';
      default:
        return '❓';
    }
  };

  const filteredStudents = enrolledStudents?.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.studentId?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const attendanceStats = {
    present: Object.values(studentAttendance).filter(a => a.status === 'present').length,
    late: Object.values(studentAttendance).filter(a => a.status === 'late').length,
    onLeave: Object.values(studentAttendance).filter(a => a.status === 'on_leave').length,
    unmarked: Object.values(studentAttendance).filter(a => a.status === null).length,
  };

  if (!enrolledStudents) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Manual Attendance - {session.sessionName}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {sessionWithSubject.subject?.name} ({sessionWithSubject.subject?.code}) • {enrolledStudents?.length || 0} students enrolled
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Stats Bar */}
        <div className="p-4 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{attendanceStats.present}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Present</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{attendanceStats.late}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Late</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{attendanceStats.onLeave}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">On Leave</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">{attendanceStats.unmarked}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Unmarked</div>
            </div>
          </div>
        </div>

        {/* Search and Controls */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-600">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search students by name or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedStatus('present')}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  selectedStatus === 'present' 
                    ? 'bg-green-500 text-white shadow-lg' 
                    : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
                }`}
              >
                ✅ Present
              </button>
              <button
                onClick={() => setSelectedStatus('late')}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  selectedStatus === 'late' 
                    ? 'bg-orange-500 text-white shadow-lg' 
                    : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
                }`}
              >
                ⏰ Late
              </button>
              <button
                onClick={() => setSelectedStatus('on_leave')}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  selectedStatus === 'on_leave' 
                    ? 'bg-red-500 text-white shadow-lg' 
                    : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
                }`}
              >
                🏠 On Leave
              </button>
            </div>
          </div>
        </div>

        {/* Student List */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredStudents.map((student) => {
              const attendance = studentAttendance[student._id];
              const currentStatus = attendance?.status;
              
              return (
                <div
                  key={student._id}
                  className={`p-4 rounded-xl border-2 transition-all duration-300 hover:shadow-lg ${
                    currentStatus
                      ? currentStatus === 'present'
                        ? 'border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800'
                        : currentStatus === 'late'
                        ? 'border-orange-200 bg-orange-50 dark:bg-orange-900/20 dark:border-orange-800'
                        : 'border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800'
                      : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-blue-300 dark:hover:border-blue-600'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {student.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        ID: {student.studentId || 'N/A'}
                      </p>
                    </div>
                    {currentStatus && (
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl">{getStatusIcon(currentStatus)}</span>
                        <span className={`text-sm font-medium ${
                          currentStatus === 'present' ? 'text-green-700 dark:text-green-300' :
                          currentStatus === 'late' ? 'text-orange-700 dark:text-orange-300' :
                          'text-red-700 dark:text-red-300'
                        }`}>
                          {currentStatus === 'present' ? 'Present' : 
                           currentStatus === 'late' ? 'Late' : 'On Leave'}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => handleStatusChange(student._id, 'present')}
                      className={`py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                        currentStatus === 'present'
                          ? 'bg-green-500 text-white shadow-md'
                          : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/50'
                      }`}
                    >
                      ✅
                    </button>
                    <button
                      onClick={() => handleStatusChange(student._id, 'late')}
                      className={`py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                        currentStatus === 'late'
                          ? 'bg-orange-500 text-white shadow-md'
                          : 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 hover:bg-orange-200 dark:hover:bg-orange-900/50'
                      }`}
                    >
                      ⏰
                    </button>
                    <button
                      onClick={() => handleStatusChange(student._id, 'on_leave')}
                      className={`py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                        currentStatus === 'on_leave'
                          ? 'bg-red-500 text-white shadow-md'
                          : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/50'
                      }`}
                    >
                      🏠
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredStudents.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">🔍</div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No students found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Try adjusting your search terms
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {Object.values(studentAttendance).filter(a => a.status !== null).length} of {enrolledStudents.length} students marked
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveAttendance}
              disabled={isSaving || Object.values(studentAttendance).filter(a => a.status !== null).length === 0}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors font-medium"
            >
              {isSaving ? 'Saving...' : 'Save Attendance'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManualAttendanceSession;
