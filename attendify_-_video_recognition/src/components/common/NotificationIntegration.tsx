import React from 'react';
import { useNotify } from './NotificationSystem';

// Integration examples for the Attendify app
export const useAttendifyNotifications = () => {
  const notify = useNotify();

  return {
    // Attendance notifications
    attendanceMarked: (studentName: string, status: string) => {
      const statusMessages = {
        present: `${studentName} marked as present`,
        absent: `${studentName} marked as absent`,
        late: `${studentName} marked as late`,
        on_leave: `${studentName} is on approved leave`
      };
      
      const type = status === 'present' ? 'success' : 
                   status === 'absent' ? 'error' : 
                   status === 'late' ? 'warning' : 'info';
      
      notify.custom({
        type,
        title: 'Attendance Updated',
        message: statusMessages[status as keyof typeof statusMessages] || `${studentName} attendance updated`,
        duration: 3000
      });
    },

    // Leave request notifications
    leaveRequestSubmitted: () => {
      notify.success(
        'Leave Request Submitted',
        'Your leave request has been submitted and notifications sent to your teacher and parent.',
        { duration: 5000 }
      );
    },

    leaveRequestApproved: (dates: string) => {
      notify.success(
        'Leave Request Approved',
        `Your leave request for ${dates} has been approved.`,
        { duration: 6000 }
      );
    },

    leaveRequestRejected: (reason?: string) => {
      notify.error(
        'Leave Request Rejected',
        reason ? `Your leave request was rejected: ${reason}` : 'Your leave request was rejected.',
        { duration: 8000 }
      );
    },

    // Email notifications
    emailSent: (recipient: string) => {
      notify.success(
        'Email Sent',
        `Notification email sent to ${recipient}`,
        { duration: 3000 }
      );
    },

    emailFailed: (recipient: string) => {
      notify.error(
        'Email Failed',
        `Failed to send notification to ${recipient}. Please try again.`,
        { duration: 5000 }
      );
    },

    // Session notifications
    sessionStarted: (sessionName: string) => {
      notify.info(
        'Session Started',
        `Attendance session "${sessionName}" is now active`,
        { duration: 4000 }
      );
    },

    sessionEnded: (sessionName: string) => {
      notify.warning(
        'Session Ended',
        `Attendance session "${sessionName}" has been closed`,
        { duration: 4000 }
      );
    },

    // Face recognition notifications
    faceRecognitionSuccess: (studentName: string) => {
      notify.success(
        'Face Recognition Success',
        `${studentName} identified and attendance marked`,
        { duration: 3000 }
      );
    },

    faceRecognitionFailed: () => {
      notify.error(
        'Face Recognition Failed',
        'Unable to identify face. Please try again or use manual attendance.',
        { duration: 5000 }
      );
    },

    // Profile notifications
    profileUpdated: () => {
      notify.success(
        'Profile Updated',
        'Your profile information has been saved successfully',
        { duration: 3000 }
      );
    },

    profilePictureUpdated: () => {
      notify.success(
        'Profile Picture Updated',
        'Your profile picture has been updated successfully',
        { duration: 3000 }
      );
    },

    // Error notifications
    networkError: () => {
      notify.error(
        'Network Error',
        'Unable to connect to the server. Please check your internet connection.',
        { duration: 6000 }
      );
    },

    permissionDenied: (action: string) => {
      notify.error(
        'Permission Denied',
        `You don't have permission to ${action}`,
        { duration: 4000 }
      );
    },

    // System notifications
    systemMaintenance: (duration: string) => {
      notify.warning(
        'System Maintenance',
        `The system will be under maintenance for ${duration}. Please save your work.`,
        { 
          duration: 0, // Persistent
          dismissible: true 
        }
      );
    },

    // Generic notifications
    operationSuccess: (operation: string) => {
      notify.success(
        'Success',
        `${operation} completed successfully`,
        { duration: 3000 }
      );
    },

    operationFailed: (operation: string, error?: string) => {
      notify.error(
        'Operation Failed',
        error ? `${operation} failed: ${error}` : `${operation} failed. Please try again.`,
        { duration: 5000 }
      );
    },

    // Interactive notifications
    confirmAction: (message: string, onConfirm: () => void) => {
      notify.custom({
        type: 'warning',
        title: 'Confirm Action',
        message: `${message} Click to confirm.`,
        duration: 10000,
        onClick: onConfirm
      });
    },

    // Custom notification method
    custom: (config: any) => {
      notify.custom(config);
    }
  };
};

// Example component showing integration
const NotificationIntegrationExample: React.FC = () => {
  const attendifyNotify = useAttendifyNotifications();

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
        Attendify Notification Examples
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <button
          onClick={() => attendifyNotify.attendanceMarked('John Doe', 'present')}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg"
        >
          Mark Present
        </button>
        
        <button
          onClick={() => attendifyNotify.leaveRequestSubmitted()}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          Leave Request
        </button>
        
        <button
          onClick={() => attendifyNotify.faceRecognitionSuccess('Jane Smith')}
          className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg"
        >
          Face Recognition
        </button>
        
        <button
          onClick={() => attendifyNotify.emailSent('parent@example.com')}
          className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg"
        >
          Email Sent
        </button>
        
        <button
          onClick={() => attendifyNotify.networkError()}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
        >
          Network Error
        </button>
        
        <button
          onClick={() => attendifyNotify.confirmAction(
            'Delete this record?', 
            () => alert('Record deleted!')
          )}
          className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg"
        >
          Confirm Action
        </button>
      </div>
    </div>
  );
};

export default NotificationIntegrationExample;
