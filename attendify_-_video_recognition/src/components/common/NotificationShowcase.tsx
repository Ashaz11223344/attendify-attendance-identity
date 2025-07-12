import React from 'react';
import { useNotify } from './NotificationSystem';
import { Bell, Zap, CheckCircle, AlertTriangle, AlertCircle, Info, Mail, Send } from 'lucide-react';

const NotificationShowcase: React.FC = () => {
  const notify = useNotify();

  const showEmailNotification = () => {
    notify.info(
      'Email Sending',
      'Sending attendance notification emails to parents...',
      { duration: 3000 }
    );

    setTimeout(() => {
      notify.success(
        'Emails Sent Successfully!',
        '15 of 15 emails sent to parents. All notifications delivered.',
        { duration: 5000 }
      );
    }, 2000);
  };

  const showLeaveRequestNotification = () => {
    notify.success(
      'Leave Request Submitted',
      'Your leave request has been submitted and email notifications sent to your teacher and parent.',
      { duration: 6000 }
    );
  };

  const showAttendanceNotification = () => {
    notify.custom({
      type: 'success',
      title: 'Attendance Marked',
      message: 'John Doe marked as present via face recognition',
      duration: 4000,
      onClick: () => {
        notify.info('Details', 'Attendance recorded at 9:15 AM for Mathematics class');
      }
    });
  };

  const showSystemMaintenanceNotification = () => {
    notify.custom({
      type: 'warning',
      title: 'System Maintenance Scheduled',
      message: 'The system will be under maintenance tonight from 11 PM to 1 AM. Please save your work.',
      duration: 0, // Persistent
      dismissible: true
    });
  };

  const showMultipleNotifications = () => {
    notify.info('Processing', 'Starting bulk email send...');
    
    setTimeout(() => {
      notify.success('Batch 1 Complete', '25 emails sent to teachers');
    }, 1000);
    
    setTimeout(() => {
      notify.success('Batch 2 Complete', '30 emails sent to students');
    }, 2000);
    
    setTimeout(() => {
      notify.success('Batch 3 Complete', '45 emails sent to parents');
    }, 3000);
    
    setTimeout(() => {
      notify.custom({
        type: 'success',
        title: 'All Emails Sent!',
        message: '100 emails delivered successfully. Click to view detailed report.',
        duration: 8000,
        onClick: () => {
          notify.info('Email Report', 'Detailed email delivery report would open here');
        }
      });
    }, 4000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-purple-500 rounded-lg">
          <Bell className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Notification System Demo</h2>
          <p className="text-gray-400">Test the in-browser push notification system</p>
        </div>
      </div>

      {/* Notification Types */}
      <div className="bg-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
          <Zap className="w-5 h-5" />
          <span>Basic Notification Types</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => notify.info('Information', 'This is an informational message')}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-lg transition-colors font-medium flex items-center justify-center space-x-2"
          >
            <Info className="w-4 h-4" />
            <span>Info</span>
          </button>
          <button
            onClick={() => notify.success('Success!', 'Operation completed successfully')}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-lg transition-colors font-medium flex items-center justify-center space-x-2"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Success</span>
          </button>
          <button
            onClick={() => notify.warning('Warning', 'Please review this important information')}
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-3 rounded-lg transition-colors font-medium flex items-center justify-center space-x-2"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Warning</span>
          </button>
          <button
            onClick={() => notify.error('Error', 'Something went wrong. Please try again.')}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-3 rounded-lg transition-colors font-medium flex items-center justify-center space-x-2"
          >
            <AlertCircle className="w-4 h-4" />
            <span>Error</span>
          </button>
        </div>
      </div>

      {/* Attendify-Specific Notifications */}
      <div className="bg-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
          <Mail className="w-5 h-5" />
          <span>Attendify Email + Push Notifications</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <button
            onClick={showEmailNotification}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-3 rounded-lg transition-colors font-medium flex items-center justify-center space-x-2"
          >
            <Send className="w-4 h-4" />
            <span>Email Notifications</span>
          </button>
          <button
            onClick={showLeaveRequestNotification}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-lg transition-colors font-medium flex items-center justify-center space-x-2"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Leave Request</span>
          </button>
          <button
            onClick={showAttendanceNotification}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-3 rounded-lg transition-colors font-medium flex items-center justify-center space-x-2"
          >
            <Zap className="w-4 h-4" />
            <span>Face Recognition</span>
          </button>
        </div>
      </div>

      {/* Advanced Features */}
      <div className="bg-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Advanced Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={showSystemMaintenanceNotification}
            className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-3 rounded-lg transition-colors font-medium"
          >
            🔧 Persistent Notification (System Maintenance)
          </button>
          <button
            onClick={showMultipleNotifications}
            className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-3 rounded-lg transition-colors font-medium"
          >
            📧 Multiple Email Batch Notifications
          </button>
        </div>
      </div>

      {/* Features List */}
      <div className="bg-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">✨ Notification System Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div className="flex items-center text-green-400">
              <CheckCircle className="w-4 h-4 mr-2" />
              <span>Real-time push notifications</span>
            </div>
            <div className="flex items-center text-green-400">
              <CheckCircle className="w-4 h-4 mr-2" />
              <span>Email + in-browser notifications</span>
            </div>
            <div className="flex items-center text-green-400">
              <CheckCircle className="w-4 h-4 mr-2" />
              <span>Clickable interactive notifications</span>
            </div>
            <div className="flex items-center text-green-400">
              <CheckCircle className="w-4 h-4 mr-2" />
              <span>Auto-dismiss with progress bar</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center text-green-400">
              <CheckCircle className="w-4 h-4 mr-2" />
              <span>Persistent notifications option</span>
            </div>
            <div className="flex items-center text-green-400">
              <CheckCircle className="w-4 h-4 mr-2" />
              <span>Multiple notification types</span>
            </div>
            <div className="flex items-center text-green-400">
              <CheckCircle className="w-4 h-4 mr-2" />
              <span>Smooth animations & transitions</span>
            </div>
            <div className="flex items-center text-green-400">
              <CheckCircle className="w-4 h-4 mr-2" />
              <span>Accessibility support</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationShowcase;
