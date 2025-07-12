import React, { useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Doc } from '../../../convex/_generated/dataModel';
import LoadingSpinner from '../LoadingSpinner';
import { BarChart3, Calendar, TrendingUp, TrendingDown, Clock, CheckCircle, XCircle, AlertCircle, Download, Filter } from 'lucide-react';

interface DetailedReportProps {
  profile: Doc<"userProfiles">;
  userRole?: 'student' | 'teacher' | 'admin';
}

const DetailedReport: React.FC<DetailedReportProps> = ({ profile, userRole = 'student' }) => {
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'semester'>('month');
  
  const mySubjects = useQuery(api.subjects.getMySubjects);
  const attendanceData = useQuery(api.attendance.getDetailedAttendanceReport, {
    subjectId: selectedSubject === 'all' ? undefined : selectedSubject as any,
    dateRange,
  });

  if (mySubjects === undefined || attendanceData === undefined) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  const calculateStats = () => {
    if (!attendanceData || attendanceData.length === 0) {
      return {
        totalClasses: 0,
        present: 0,
        absent: 0,
        late: 0,
        percentage: 0,
        trend: 'stable' as const
      };
    }

    const total = attendanceData.length;
    const present = attendanceData.filter(a => a.status === 'present').length;
    const absent = attendanceData.filter(a => a.status === 'absent').length;
    const late = attendanceData.filter(a => a.status === 'late').length;
    const percentage = total > 0 ? Math.round(((present + late) / total) * 100) : 0;

    // Calculate trend (simplified)
    const recentData = attendanceData.slice(-10);
    const recentPercentage = recentData.length > 0 ? 
      Math.round(((recentData.filter(a => a.status === 'present' || a.status === 'late').length) / recentData.length) * 100) : 0;
    
    const trend = recentPercentage > percentage ? 'up' : recentPercentage < percentage ? 'down' : 'stable';

    return { totalClasses: total, present, absent, late, percentage, trend };
  };

  const stats = calculateStats();

  const getSubjectStats = () => {
    if (!attendanceData || !mySubjects) return [];
    
    return mySubjects.map(subject => {
      const subjectAttendance = attendanceData.filter(a => a.subjectId === subject._id);
      const total = subjectAttendance.length;
      const present = subjectAttendance.filter(a => a.status === 'present').length;
      const late = subjectAttendance.filter(a => a.status === 'late').length;
      const percentage = total > 0 ? Math.round(((present + late) / total) * 100) : 0;
      
      return {
        subject: subject.name,
        code: subject.code,
        total,
        present,
        late,
        absent: total - present - late,
        percentage
      };
    });
  };

  const subjectStats = getSubjectStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Detailed Attendance Report
        </h2>
        <div className="flex items-center space-x-3">
          <button className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filters:</span>
          </div>
          
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          >
            <option value="all">All Subjects</option>
            {mySubjects?.map(subject => (
              <option key={subject._id} value={subject._id}>
                {subject.name} ({subject.code})
              </option>
            ))}
          </select>

          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as any)}
            className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          >
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="semester">This Semester</option>
          </select>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Overall Attendance</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {stats.percentage}%
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              {stats.trend === 'up' ? (
                <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
              ) : stats.trend === 'down' ? (
                <TrendingDown className="w-6 h-6 text-red-600 dark:text-red-400" />
              ) : (
                <BarChart3 className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              )}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Present</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {stats.present}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Late</p>
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {stats.late}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Absent</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                {stats.absent}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
              <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Subject-wise Breakdown */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Subject-wise Performance
        </h3>
        
        {subjectStats.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No attendance data available</p>
          </div>
        ) : (
          <div className="space-y-4">
            {subjectStats.map((stat, index) => (
              <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {stat.subject}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Code: {stat.code}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {stat.percentage}%
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {stat.present + stat.late}/{stat.total} classes
                    </p>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 mb-3">
                  <div
                    className={`h-2 rounded-full ${
                      stat.percentage >= 75 ? 'bg-green-500' :
                      stat.percentage >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${stat.percentage}%` }}
                  ></div>
                </div>
                
                {/* Detailed Stats */}
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="text-center">
                    <p className="text-green-600 dark:text-green-400 font-medium">{stat.present}</p>
                    <p className="text-gray-600 dark:text-gray-400">Present</p>
                  </div>
                  <div className="text-center">
                    <p className="text-yellow-600 dark:text-yellow-400 font-medium">{stat.late}</p>
                    <p className="text-gray-600 dark:text-gray-400">Late</p>
                  </div>
                  <div className="text-center">
                    <p className="text-red-600 dark:text-red-400 font-medium">{stat.absent}</p>
                    <p className="text-gray-600 dark:text-gray-400">Absent</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Recent Attendance History
        </h3>
        
        {attendanceData && attendanceData.length > 0 ? (
          <div className="space-y-3">
            {attendanceData.slice(0, 10).map((record, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    record.status === 'present' ? 'bg-green-500' :
                    record.status === 'late' ? 'bg-yellow-500' : 'bg-red-500'
                  }`}></div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {record.subjectName}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {new Date(record.date).toLocaleDateString()} • {record.sessionName}
                    </p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  record.status === 'present' 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                    : record.status === 'late'
                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                    : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                }`}>
                  {record.status}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No recent attendance records</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DetailedReport;
