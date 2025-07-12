import React, { useState, useMemo } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Doc } from '../../../convex/_generated/dataModel';
import LoadingSpinner from '../LoadingSpinner';

interface AttendanceHistoryProps {
  profile: Doc<"userProfiles">;
}

const AttendanceHistory: React.FC<AttendanceHistoryProps> = ({ profile }) => {
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'all'>('month');

  const mySubjects = useQuery(api.subjects.getMySubjects);
  
  // Calculate date range
  const getDateRange = () => {
    const now = new Date();
    const startDate = new Date();
    
    switch (dateRange) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      default:
        return {};
    }
    
    return {
      startDate: startDate.getTime(),
      endDate: now.getTime(),
    };
  };

  const attendanceHistory = useQuery(api.attendance.getStudentAttendance, {
    subjectId: selectedSubject ? (selectedSubject as any) : undefined,
    ...getDateRange(),
  });

  if (mySubjects === undefined || attendanceHistory === undefined) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  // Calculate statistics
  const stats = useMemo(() => {
    if (!attendanceHistory) return { total: 0, present: 0, absent: 0, late: 0, percentage: 0 };
    
    const total = attendanceHistory.length;
    const present = attendanceHistory.filter(a => a.status === 'present').length;
    const absent = attendanceHistory.filter(a => a.status === 'absent').length;
    const late = attendanceHistory.filter(a => a.status === 'late').length;
    const percentage = total > 0 ? Math.round(((present + late) / total) * 100) : 0;
    
    return { total, present, absent, late, percentage };
  }, [attendanceHistory]);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
        My Attendance History
      </h2>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Subject
            </label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">All Subjects</option>
              {mySubjects.map((subject) => (
                <option key={subject._id} value={subject._id}>
                  {subject.name} ({subject.code})
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Time Period
            </label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
              <option value="all">All Time</option>
            </select>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {stats.percentage}%
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Attendance Rate</p>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {stats.total}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Classes</p>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {stats.present}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Present</p>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">
              {stats.absent}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Absent</p>
          </div>
        </div>
      </div>

      {/* Attendance Records */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Attendance Records
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          {attendanceHistory.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📋</span>
              </div>
              <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No Attendance Records
              </h4>
              <p className="text-gray-600 dark:text-gray-400">
                Your attendance records will appear here once classes begin.
              </p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Subject
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Session
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Mode
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Time
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                {attendanceHistory.map((record) => (
                  <tr key={record._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {new Date(record.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {record.subject?.name} ({record.subject?.code})
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                      {record.session?.sessionName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        record.status === 'present'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                          : record.status === 'late'
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                          : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                      }`}>
                        {record.status === 'present' ? '✅ Present' :
                         record.status === 'late' ? '⏰ Late' : '❌ Absent'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        record.attendanceMode === 'face_scan'
                          ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                      }`}>
                        {record.attendanceMode === 'face_scan' ? '📷 Face Scan' : '✏️ Manual'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                      {record.checkInTime ? new Date(record.checkInTime).toLocaleTimeString() : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default AttendanceHistory;
