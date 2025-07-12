import React, { useState } from 'react';
import { useQuery, useMutation, useAction } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Doc, Id } from '../../../convex/_generated/dataModel';
import { toast } from 'sonner';
import LoadingSpinner from '../LoadingSpinner';

interface ReportsManagementProps {
  profile: Doc<"userProfiles">;
}

type ReportType = 'summary' | 'detailed' | 'student_wise' | 'subject_wise';
type FileFormat = 'csv' | 'excel';

const ReportsManagement: React.FC<ReportsManagementProps> = ({ profile }) => {
  const [reportConfig, setReportConfig] = useState({
    reportType: 'summary' as ReportType,
    subjectId: '' as string,
    studentId: '' as string,
    startDate: '',
    endDate: '',
  });

  const [emailConfig, setEmailConfig] = useState({
    recipients: [''],
    subject: 'Attendify - Attendance Report',
    message: 'Please find the attached attendance report generated from Attendify system.',
    format: 'csv' as FileFormat,
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [reportPreview, setReportPreview] = useState<any>(null);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [shouldGeneratePreview, setShouldGeneratePreview] = useState(false);

  const subjects = useQuery(api.subjects.getAllSubjects);
  const students = useQuery(api.userProfiles.getAllStudents);
  const generateAndEmailReport = useAction(api.reports.generateAndEmailReport);
  
  // Generate preview using query
  const previewData = useQuery(
    api.reports.generateAttendanceReport,
    shouldGeneratePreview ? {
      reportType: reportConfig.reportType,
      ...(reportConfig.subjectId && { subjectId: reportConfig.subjectId as Id<"subjects"> }),
      ...(reportConfig.studentId && { studentId: reportConfig.studentId as Id<"userProfiles"> }),
      ...(reportConfig.startDate && { startDate: reportConfig.startDate }),
      ...(reportConfig.endDate && { endDate: reportConfig.endDate }),
    } : "skip"
  );

  const handleGeneratePreview = () => {
    setShouldGeneratePreview(true);
    toast.success('Generating report preview...');
  };

  // Update preview when data is available
  React.useEffect(() => {
    if (previewData && shouldGeneratePreview) {
      setReportPreview(previewData);
      setShouldGeneratePreview(false);
      toast.success('Report preview generated successfully');
    }
  }, [previewData, shouldGeneratePreview]);

  const handleSendReport = async () => {
    if (!reportPreview) {
      toast.error('Please generate a report preview first');
      return;
    }

    const validRecipients = emailConfig.recipients.filter(email => email.trim() !== '');
    if (validRecipients.length === 0) {
      toast.error('Please add at least one recipient email');
      return;
    }

    setIsGenerating(true);
    try {
      const config = {
        reportType: reportConfig.reportType,
        ...(reportConfig.subjectId && { subjectId: reportConfig.subjectId as Id<"subjects"> }),
        ...(reportConfig.studentId && { studentId: reportConfig.studentId as Id<"userProfiles"> }),
        ...(reportConfig.startDate && { startDate: reportConfig.startDate }),
        ...(reportConfig.endDate && { endDate: reportConfig.endDate }),
      };

      const result = await generateAndEmailReport({
        reportConfig: config,
        emailConfig: {
          recipients: validRecipients,
          subject: emailConfig.subject,
          message: emailConfig.message,
          format: emailConfig.format,
        },
      });

      if (result.success) {
        toast.success(`Report sent successfully to ${result.results.filter((r: any) => r.success).length} recipients`);
        setShowEmailForm(false);
      } else {
        toast.error('Failed to send report emails');
      }
    } catch (error) {
      toast.error('Failed to send report');
      console.error('Email sending error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const addRecipient = () => {
    setEmailConfig(prev => ({
      ...prev,
      recipients: [...prev.recipients, '']
    }));
  };

  const removeRecipient = (index: number) => {
    setEmailConfig(prev => ({
      ...prev,
      recipients: prev.recipients.filter((_, i) => i !== index)
    }));
  };

  const updateRecipient = (index: number, value: string) => {
    setEmailConfig(prev => ({
      ...prev,
      recipients: prev.recipients.map((email, i) => i === index ? value : email)
    }));
  };

  const renderReportPreview = () => {
    if (!reportPreview) return null;

    const { type, data } = reportPreview;

    switch (type) {
      case 'summary':
        return (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              📊 Summary Report Preview
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{data.totalSessions}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Sessions</div>
              </div>
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{data.totalStudents}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Students</div>
              </div>
              <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{data.presentCount}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Present</div>
              </div>
              <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">{data.attendanceRate}%</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Attendance Rate</div>
              </div>
            </div>
          </div>
        );

      case 'detailed':
        return (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              📋 Detailed Report Preview ({data.length} records)
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-2 px-3">Student</th>
                    <th className="text-left py-2 px-3">Subject</th>
                    <th className="text-left py-2 px-3">Date</th>
                    <th className="text-left py-2 px-3">Status</th>
                    <th className="text-left py-2 px-3">Mode</th>
                  </tr>
                </thead>
                <tbody>
                  {data.slice(0, 10).map((record: any, index: number) => (
                    <tr key={index} className="border-b border-gray-100 dark:border-gray-700">
                      <td className="py-2 px-3">{record.studentName}</td>
                      <td className="py-2 px-3">{record.subjectCode}</td>
                      <td className="py-2 px-3">{record.date}</td>
                      <td className="py-2 px-3">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          record.status === 'present' ? 'bg-green-100 text-green-800' :
                          record.status === 'late' ? 'bg-orange-100 text-orange-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {record.status}
                        </span>
                      </td>
                      <td className="py-2 px-3">{record.attendanceMode}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {data.length > 10 && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  ... and {data.length - 10} more records
                </p>
              )}
            </div>
          </div>
        );

      case 'student_wise':
        return (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              👥 Student-wise Report Preview ({data.length} students)
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-2 px-3">Student</th>
                    <th className="text-left py-2 px-3">ID</th>
                    <th className="text-left py-2 px-3">Sessions</th>
                    <th className="text-left py-2 px-3">Present</th>
                    <th className="text-left py-2 px-3">Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {data.slice(0, 10).map((student: any, index: number) => (
                    <tr key={index} className="border-b border-gray-100 dark:border-gray-700">
                      <td className="py-2 px-3">{student.studentName}</td>
                      <td className="py-2 px-3">{student.studentNumber}</td>
                      <td className="py-2 px-3">{student.totalSessions}</td>
                      <td className="py-2 px-3">{student.presentCount}</td>
                      <td className="py-2 px-3">{student.attendanceRate}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'subject_wise':
        return (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              📚 Subject-wise Report Preview ({data.length} subjects)
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-2 px-3">Subject</th>
                    <th className="text-left py-2 px-3">Code</th>
                    <th className="text-left py-2 px-3">Sessions</th>
                    <th className="text-left py-2 px-3">Students</th>
                    <th className="text-left py-2 px-3">Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((subject: any, index: number) => (
                    <tr key={index} className="border-b border-gray-100 dark:border-gray-700">
                      <td className="py-2 px-3">{subject.subjectName}</td>
                      <td className="py-2 px-3">{subject.subjectCode}</td>
                      <td className="py-2 px-3">{subject.totalSessions}</td>
                      <td className="py-2 px-3">{subject.totalStudents}</td>
                      <td className="py-2 px-3">{subject.attendanceRate}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (subjects === undefined || students === undefined) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">📊 Reports Management</h2>
        <p className="text-blue-100">
          Generate detailed attendance reports and send them via email
        </p>
      </div>

      {/* Report Configuration */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Report Configuration
        </h3>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Report Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Report Type
            </label>
            <select
              value={reportConfig.reportType}
              onChange={(e) => setReportConfig(prev => ({ ...prev, reportType: e.target.value as ReportType }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="summary">Summary Report</option>
              <option value="detailed">Detailed Report</option>
              <option value="student_wise">Student-wise Report</option>
              <option value="subject_wise">Subject-wise Report</option>
            </select>
          </div>

          {/* Subject Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Subject (Optional)
            </label>
            <select
              value={reportConfig.subjectId}
              onChange={(e) => setReportConfig(prev => ({ ...prev, subjectId: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">All Subjects</option>
              {subjects?.map((subject) => (
                <option key={subject._id} value={subject._id}>
                  {subject.name} ({subject.code})
                </option>
              ))}
            </select>
          </div>

          {/* Student Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Student (Optional)
            </label>
            <select
              value={reportConfig.studentId}
              onChange={(e) => setReportConfig(prev => ({ ...prev, studentId: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">All Students</option>
              {students?.map((student) => (
                <option key={student._id} value={student._id}>
                  {student.name} ({student.studentId})
                </option>
              ))}
            </select>
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Start Date (Optional)
            </label>
            <input
              type="date"
              value={reportConfig.startDate}
              onChange={(e) => setReportConfig(prev => ({ ...prev, startDate: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              End Date (Optional)
            </label>
            <input
              type="date"
              value={reportConfig.endDate}
              onChange={(e) => setReportConfig(prev => ({ ...prev, endDate: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>

        <div className="flex space-x-3 mt-6">
          <button
            onClick={handleGeneratePreview}
            disabled={shouldGeneratePreview}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-lg transition-colors font-medium"
          >
            {shouldGeneratePreview ? 'Generating...' : '📊 Generate Preview'}
          </button>
          
          {reportPreview && (
            <button
              onClick={() => setShowEmailForm(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors font-medium"
            >
              📧 Send via Email
            </button>
          )}
        </div>
      </div>

      {/* Report Preview */}
      {reportPreview && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Report Preview
          </h3>
          {renderReportPreview()}
        </div>
      )}

      {/* Email Configuration Modal */}
      {showEmailForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  📧 Email Report Configuration
                </h3>
                <button
                  onClick={() => setShowEmailForm(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                {/* Recipients */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Recipients
                  </label>
                  {emailConfig.recipients.map((recipient, index) => (
                    <div key={index} className="flex space-x-2 mb-2">
                      <input
                        type="email"
                        value={recipient}
                        onChange={(e) => updateRecipient(index, e.target.value)}
                        placeholder="Enter email address"
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                      {emailConfig.recipients.length > 1 && (
                        <button
                          onClick={() => removeRecipient(index)}
                          className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={addRecipient}
                    className="text-blue-600 dark:text-blue-400 text-sm hover:underline"
                  >
                    + Add another recipient
                  </button>
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email Subject
                  </label>
                  <input
                    type="text"
                    value={emailConfig.subject}
                    onChange={(e) => setEmailConfig(prev => ({ ...prev, subject: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Message
                  </label>
                  <textarea
                    value={emailConfig.message}
                    onChange={(e) => setEmailConfig(prev => ({ ...prev, message: e.target.value }))}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                {/* File Format */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    File Format
                  </label>
                  <select
                    value={emailConfig.format}
                    onChange={(e) => setEmailConfig(prev => ({ ...prev, format: e.target.value as FileFormat }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="csv">CSV File</option>
                    <option value="excel">Excel File</option>
                  </select>
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowEmailForm(false)}
                  className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendReport}
                  disabled={isGenerating}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-6 py-2 rounded-lg transition-colors font-medium"
                >
                  {isGenerating ? 'Sending...' : '📧 Send Report'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsManagement;
