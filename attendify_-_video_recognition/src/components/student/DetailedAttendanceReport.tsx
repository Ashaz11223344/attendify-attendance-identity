import React, { useState, useMemo } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Doc } from '../../../convex/_generated/dataModel';
import LoadingSpinner from '../LoadingSpinner';

interface DetailedAttendanceReportProps {
  profile: Doc<"userProfiles">;
}

const DetailedAttendanceReport: React.FC<DetailedAttendanceReportProps> = ({ profile }) => {
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'semester' | 'all'>('semester');
  const [viewMode, setViewMode] = useState<'summary' | 'detailed'>('summary');

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
      case 'semester':
        startDate.setMonth(now.getMonth() - 4); // 4 months for semester
        break;
      default:
        return {};
    }
    
    return {
      startDate: startDate.getTime(),
      endDate: now.getTime(),
    };
  };

    const attendanceHistory = useQuery(api.attendance.getStudentAttendance, 
    selectedSubject ? { subjectId: selectedSubject as any, ...getDateRange() } : "skip"
  );

  if (mySubjects === undefined || attendanceHistory === undefined) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  // Calculate comprehensive statistics
  const stats = useMemo(() => {
    if (!attendanceHistory) return {
      total: 0,
      present: 0,
      absent: 0,
      late: 0,
      onLeave: 0,
      percentage: 0,
      subjectStats: {},
      monthlyStats: {},
      weeklyTrend: []
    };
    
    const total = attendanceHistory.length;
    const present = attendanceHistory.filter(a => a.status === 'present').length;
    const absent = attendanceHistory.filter(a => a.status === 'absent').length;
    const late = attendanceHistory.filter(a => a.status === 'late').length;
    const onLeave = attendanceHistory.filter(a => a.status === 'on_leave').length;
    const percentage = total > 0 ? Math.round(((present + late) / total) * 100) : 0;
    
    // Subject-wise statistics
    const subjectStats: Record<string, any> = {};
    attendanceHistory.forEach(record => {
      if (record.subject) {
        const subjectKey = record.subject.code;
        if (!subjectStats[subjectKey]) {
          subjectStats[subjectKey] = {
            name: record.subject.name,
            code: record.subject.code,
            total: 0,
            present: 0,
            late: 0,
            absent: 0,
            onLeave: 0,
          };
        }
        subjectStats[subjectKey].total++;
        subjectStats[subjectKey][record.status]++;
      }
    });

    // Calculate percentages for each subject
    Object.values(subjectStats).forEach((subject: any) => {
      subject.percentage = subject.total > 0 ? 
        Math.round(((subject.present + subject.late) / subject.total) * 100) : 0;
    });

    // Monthly statistics
    const monthlyStats: Record<string, any> = {};
    attendanceHistory.forEach(record => {
      const month = new Date(record.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
      if (!monthlyStats[month]) {
        monthlyStats[month] = { total: 0, present: 0, late: 0, absent: 0, onLeave: 0 };
      }
      monthlyStats[month].total++;
      monthlyStats[month][record.status]++;
    });

    // Weekly trend (last 8 weeks)
    const weeklyTrend = [];
    for (let i = 7; i >= 0; i--) {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - (i * 7));
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      
      const weekRecords = attendanceHistory.filter(record => {
        const recordDate = new Date(record.date);
        return recordDate >= weekStart && recordDate <= weekEnd;
      });
      
      const weekPresent = weekRecords.filter(r => r.status === 'present' || r.status === 'late').length;
      const weekTotal = weekRecords.length;
      const weekPercentage = weekTotal > 0 ? Math.round((weekPresent / weekTotal) * 100) : 0;
      
      weeklyTrend.push({
        week: `Week ${8 - i}`,
        date: weekStart.toLocaleDateString(),
        percentage: weekPercentage,
        total: weekTotal,
        present: weekPresent,
      });
    }
    
    return { 
      total, 
      present, 
      absent, 
      late, 
      onLeave, 
      percentage, 
      subjectStats, 
      monthlyStats, 
      weeklyTrend 
    };
  }, [attendanceHistory]);

  const getAttendanceColor = (percentage: number) => {
    if (percentage >= 85) return 'text-green-600 dark:text-green-400';
    if (percentage >= 75) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getAttendanceBg = (percentage: number) => {
    if (percentage >= 85) return 'bg-green-100 dark:bg-green-900/30';
    if (percentage >= 75) return 'bg-yellow-100 dark:bg-yellow-900/30';
    return 'bg-red-100 dark:bg-red-900/30';
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
        📊 Detailed Attendance Report
      </h2>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <div className="grid md:grid-cols-3 gap-4">
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
              <option value="semester">Current Semester</option>
              <option value="all">All Time</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              View Mode
            </label>
            <select
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="summary">Summary View</option>
              <option value="detailed">Detailed View</option>
            </select>
          </div>
        </div>
      </div>

      {/* Overall Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className={`rounded-xl p-4 border border-gray-200 dark:border-gray-700 ${getAttendanceBg(stats.percentage)}`}>
          <div className="text-center">
            <p className={`text-2xl font-bold ${getAttendanceColor(stats.percentage)}`}>
              {stats.percentage}%
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Overall Rate</p>
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
            <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {stats.late}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Late</p>
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

      {viewMode === 'summary' ? (
        <>
          {/* Subject-wise Statistics */}
          {Object.keys(stats.subjectStats).length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  📚 Subject-wise Attendance
                </h3>
              </div>
              <div className="p-6">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.values(stats.subjectStats).map((subject: any) => (
                    <div key={subject.code} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                        {subject.name}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        {subject.code}
                      </p>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Attendance:</span>
                          <span className={`text-sm font-medium ${getAttendanceColor(subject.percentage)}`}>
                            {subject.percentage}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Classes:</span>
                          <span className="text-sm text-gray-900 dark:text-white">{subject.total}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Present:</span>
                          <span className="text-sm text-green-600 dark:text-green-400">{subject.present}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Weekly Trend */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                📈 Weekly Attendance Trend
              </h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {stats.weeklyTrend.slice(-4).map((week, index) => (
                  <div key={index} className="text-center">
                    <div className={`w-full h-20 rounded-lg flex items-end justify-center ${getAttendanceBg(week.percentage)}`}>
                      <div className={`text-lg font-bold ${getAttendanceColor(week.percentage)}`}>
                        {week.percentage}%
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{week.week}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">{week.total} classes</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      ) : (
        /* Detailed Records */
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              📋 Detailed Attendance Records
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
                            : record.status === 'on_leave'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                        }`}>
                          {record.status === 'present' ? '✅ Present' :
                           record.status === 'late' ? '⏰ Late' : 
                           record.status === 'on_leave' ? '🏥 On Leave' : '❌ Absent'}
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
      )}

      {/* Attendance Guidelines */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-300 mb-4">
          📋 Attendance Guidelines
        </h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">Attendance Requirements:</h4>
            <ul className="space-y-1 text-blue-700 dark:text-blue-400">
              <li>• Minimum 85% attendance required</li>
              <li>• 75-84% attendance: Warning status</li>
              <li>• Below 75%: Academic probation</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">Status Meanings:</h4>
            <ul className="space-y-1 text-blue-700 dark:text-blue-400">
              <li>• <span className="text-green-600">Present:</span> On time attendance</li>
              <li>• <span className="text-yellow-600">Late:</span> Arrived after start time</li>
              <li>• <span className="text-blue-600">On Leave:</span> Approved absence</li>
              <li>• <span className="text-red-600">Absent:</span> Unexcused absence</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailedAttendanceReport;
