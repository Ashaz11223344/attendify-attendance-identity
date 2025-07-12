import React, { useState } from 'react';
import { useAction, useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useNotify } from '../common/NotificationSystem';
import { 
  Mail, 
  Send, 
  Users, 
  MessageSquare, 
  AlertCircle, 
  CheckCircle, 
  Clock,
  Bell,
  Zap
} from 'lucide-react';

const EmailManagement: React.FC = () => {
  const [emailForm, setEmailForm] = useState({
    subject: '',
    message: '',
    type: 'info' as 'info' | 'warning' | 'success' | 'error'
  });
  const [selectedRecipientType, setSelectedRecipientType] = useState<'all' | 'teachers' | 'students' | 'parents' | 'custom'>('all');
  const [customEmails, setCustomEmails] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendResults, setSendResults] = useState<any>(null);

  // Convex hooks
  const teachers = useQuery(api.userProfiles.getTeachers);
  const students = useQuery(api.userProfiles.getAllStudents);
  const sendBulkEmails = useAction(api.emailService.sendBulkNotificationEmails);
  const testEmail = useAction(api.emailService.testEmailConnectivity);

  // Notification hooks
  const notify = useNotify();

  // Get recipients based on selection
  const getRecipients = () => {
    const recipients: { email: string; name: string }[] = [];
    
    switch (selectedRecipientType) {
      case 'teachers':
        teachers?.forEach((teacher: any) => {
          if (teacher.email) {
            recipients.push({ email: teacher.email, name: teacher.name });
          }
        });
        break;
      case 'students':
        students?.forEach((student: any) => {
          if (student.email) {
            recipients.push({ email: student.email, name: student.name });
          }
        });
        break;
      case 'parents':
        students?.forEach((student: any) => {
          if (student.parentEmail) {
            recipients.push({ 
              email: student.parentEmail, 
              name: `${student.name}'s Parent` 
            });
          }
        });
        break;
      case 'all':
        // Add all teachers
        teachers?.forEach((teacher: any) => {
          if (teacher.email) {
            recipients.push({ email: teacher.email, name: teacher.name });
          }
        });
        // Add all students
        students?.forEach((student: any) => {
          if (student.email) {
            recipients.push({ email: student.email, name: student.name });
          }
        });
        // Add all parents
        students?.forEach((student: any) => {
          if (student.parentEmail) {
            recipients.push({ 
              email: student.parentEmail, 
              name: `${student.name}'s Parent` 
            });
          }
        });
        break;
      case 'custom':
        const emails = customEmails.split(',').map(email => email.trim()).filter(email => email);
        emails.forEach(email => {
          recipients.push({ email, name: email.split('@')[0] });
        });
        break;
    }
    
    return recipients;
  };

  const handleSendEmails = async () => {
    if (!emailForm.subject.trim() || !emailForm.message.trim()) {
      notify.error('Validation Error', 'Subject and message are required');
      return;
    }

    const recipients = getRecipients();
    if (recipients.length === 0) {
      notify.error('No Recipients', 'Please select recipients for the email');
      return;
    }

    setIsSending(true);
    
    try {
      // Show immediate notification that emails are being sent
      notify.info('Sending Emails', `Sending ${recipients.length} emails... This may take a moment.`);

      const result = await sendBulkEmails({
        recipients,
        subject: emailForm.subject,
        message: emailForm.message,
        type: emailForm.type
      });

      setSendResults(result);

      // Show success notification with details
      if (result.success) {
        notify.success(
          'Emails Sent Successfully!',
          `${result.successCount} of ${result.totalCount} emails sent successfully`,
          { duration: 5000 }
        );

        // Show individual notifications for failed emails if any
        if (result.successCount < result.totalCount) {
          const failedCount = result.totalCount - result.successCount;
          notify.warning(
            'Some Emails Failed',
            `${failedCount} emails failed to send. Check the results below for details.`,
            { duration: 6000 }
          );
        }

        // Reset form on success
        setEmailForm({
          subject: '',
          message: '',
          type: 'info'
        });
        setCustomEmails('');
      } else {
        notify.error('Send Failed', 'Failed to send emails');
      }
    } catch (error) {
      console.error('Email sending error:', error);
      notify.error('Send Error', 'An error occurred while sending emails');
    } finally {
      setIsSending(false);
    }
  };

  const handleTestEmail = async () => {
    const testEmailAddress = prompt('Enter your email address to test email connectivity:');
    if (!testEmailAddress) return;

    try {
      notify.info('Testing Email', 'Sending test email...');

      const result = await testEmail({ testEmail: testEmailAddress });
      
      if (result.success) {
        notify.success(
          'Test Email Sent!',
          `Test email sent successfully to ${testEmailAddress}`,
          { duration: 4000 }
        );
      } else {
        notify.error(
          'Test Email Failed',
          result.error || 'Failed to send test email',
          { duration: 5000 }
        );
      }
    } catch (error) {
      notify.error('Test Failed', 'Failed to send test email');
    }
  };

  const recipients = getRecipients();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-500 rounded-lg">
            <Mail className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Email Management</h2>
            <p className="text-gray-400">Send notifications and announcements</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Bell className="w-5 h-5 text-blue-400" />
          <span className="text-sm text-gray-400">Push notifications enabled</span>
        </div>
      </div>

      {/* Email Composition */}
      <div className="bg-gray-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
            <MessageSquare className="w-5 h-5" />
            <span>Compose Email</span>
          </h3>
          <button
            onClick={handleTestEmail}
            className="flex items-center space-x-1 px-3 py-1 bg-green-600 hover:bg-green-700 rounded-lg text-sm text-white transition-colors"
          >
            <Zap className="w-4 h-4" />
            <span>Test Email</span>
          </button>
        </div>

        <div className="space-y-4">
          {/* Recipient Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Recipients
            </label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-3">
              {(['all', 'teachers', 'students', 'parents', 'custom'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedRecipientType(type)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedRecipientType === type
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
            
            {selectedRecipientType === 'custom' && (
              <textarea
                value={customEmails}
                onChange={(e) => setCustomEmails(e.target.value)}
                placeholder="Enter email addresses separated by commas"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={3}
              />
            )}
            
            <p className="text-sm text-gray-400 mt-2">
              <Users className="w-4 h-4 inline mr-1" />
              {recipients.length} recipients selected
            </p>
          </div>

          {/* Email Type */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Email Type
            </label>
            <select
              value={emailForm.type}
              onChange={(e) => setEmailForm(prev => ({ ...prev, type: e.target.value as any }))}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="info">Information</option>
              <option value="success">Success/Good News</option>
              <option value="warning">Warning/Important</option>
              <option value="error">Alert/Urgent</option>
            </select>
          </div>

          {/* Subject */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Subject *
            </label>
            <input
              type="text"
              value={emailForm.subject}
              onChange={(e) => setEmailForm(prev => ({ ...prev, subject: e.target.value }))}
              placeholder="Enter email subject"
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Message *
            </label>
            <textarea
              value={emailForm.message}
              onChange={(e) => setEmailForm(prev => ({ ...prev, message: e.target.value }))}
              placeholder="Enter your message here..."
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={6}
              required
            />
          </div>
        </div>

        {/* Send Button */}
        <div className="flex justify-end mt-6">
          <button
            onClick={handleSendEmails}
            disabled={isSending || !emailForm.subject.trim() || !emailForm.message.trim() || recipients.length === 0}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-lg font-medium flex items-center space-x-2 transition-colors"
          >
            {isSending ? (
              <>
                <Clock className="w-4 h-4 animate-spin" />
                <span>Sending...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Send Emails & Push Notifications</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Send Results */}
      {sendResults && (
        <div className="bg-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <span>Send Results</span>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-green-900/20 border border-green-800 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-400">{sendResults.successCount}</div>
              <div className="text-sm text-green-300">Emails Sent</div>
            </div>
            <div className="bg-red-900/20 border border-red-800 rounded-lg p-4">
              <div className="text-2xl font-bold text-red-400">
                {sendResults.totalCount - sendResults.successCount}
              </div>
              <div className="text-sm text-red-300">Failed</div>
            </div>
            <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-400">{sendResults.totalCount}</div>
              <div className="text-sm text-blue-300">Total Recipients</div>
            </div>
          </div>

          {/* Detailed Results */}
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {sendResults.results?.map((result: any, index: number) => (
              <div
                key={index}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  result.success 
                    ? 'bg-green-900/20 border border-green-800' 
                    : 'bg-red-900/20 border border-red-800'
                }`}
              >
                <div className="flex items-center space-x-3">
                  {result.success ? (
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-400" />
                  )}
                  <div>
                    <div className="text-white text-sm font-medium">{result.name}</div>
                    <div className="text-gray-400 text-xs">{result.email}</div>
                  </div>
                </div>
                <div className="text-right">
                  {result.success ? (
                    <span className="text-green-400 text-xs">Sent</span>
                  ) : (
                    <span className="text-red-400 text-xs">Failed</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => {
              setEmailForm({
                subject: 'System Maintenance Notice',
                message: 'The Attendify system will undergo scheduled maintenance. Please save your work and log out before the maintenance window.',
                type: 'warning'
              });
              setSelectedRecipientType('all');
              notify.info('Template Loaded', 'Maintenance notice template loaded');
            }}
            className="p-4 bg-yellow-600 hover:bg-yellow-700 rounded-lg text-white text-center transition-colors"
          >
            <AlertCircle className="w-6 h-6 mx-auto mb-2" />
            <div className="font-medium">Maintenance Notice</div>
          </button>
          
          <button
            onClick={() => {
              setEmailForm({
                subject: 'Welcome to Attendify!',
                message: 'Welcome to the Attendify attendance management system. Please complete your profile setup and familiarize yourself with the features.',
                type: 'success'
              });
              setSelectedRecipientType('students');
              notify.info('Template Loaded', 'Welcome message template loaded');
            }}
            className="p-4 bg-green-600 hover:bg-green-700 rounded-lg text-white text-center transition-colors"
          >
            <Users className="w-6 h-6 mx-auto mb-2" />
            <div className="font-medium">Welcome Message</div>
          </button>
          
          <button
            onClick={() => {
              setEmailForm({
                subject: 'Attendance Reminder',
                message: 'This is a reminder to mark attendance for your classes. Please ensure all students are accounted for.',
                type: 'info'
              });
              setSelectedRecipientType('teachers');
              notify.info('Template Loaded', 'Attendance reminder template loaded');
            }}
            className="p-4 bg-blue-600 hover:bg-blue-700 rounded-lg text-white text-center transition-colors"
          >
            <Clock className="w-6 h-6 mx-auto mb-2" />
            <div className="font-medium">Attendance Reminder</div>
          </button>
          
          <button
            onClick={() => {
              setEmailForm({
                subject: 'Important: System Update',
                message: 'An important system update has been deployed. Please review the new features and report any issues.',
                type: 'error'
              });
              setSelectedRecipientType('all');
              notify.info('Template Loaded', 'System update template loaded');
            }}
            className="p-4 bg-red-600 hover:bg-red-700 rounded-lg text-white text-center transition-colors"
          >
            <AlertCircle className="w-6 h-6 mx-auto mb-2" />
            <div className="font-medium">System Update</div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailManagement;
