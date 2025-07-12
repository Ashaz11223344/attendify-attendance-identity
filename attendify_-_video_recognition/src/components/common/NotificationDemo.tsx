import React, { useState } from 'react';
import { useNotify } from './NotificationSystem';
import { Bell, TestTube, Settings, Zap } from 'lucide-react';

const NotificationDemo: React.FC = () => {
  const notify = useNotify();
  const [customTitle, setCustomTitle] = useState('Custom Notification');
  const [customMessage, setCustomMessage] = useState('This is a custom notification message.');
  const [customDuration, setCustomDuration] = useState(5000);

  const showInfoNotification = () => {
    notify.info(
      'Information',
      'This is an informational message to keep you updated.',
      { duration: 4000 }
    );
  };

  const showSuccessNotification = () => {
    notify.success(
      'Success!',
      'Your action was completed successfully.',
      { duration: 3000 }
    );
  };

  const showWarningNotification = () => {
    notify.warning(
      'Warning',
      'Please review this important information before proceeding.',
      { duration: 6000 }
    );
  };

  const showErrorNotification = () => {
    notify.error(
      'Error Occurred',
      'Something went wrong. Please try again or contact support.',
      { duration: 8000 }
    );
  };

  const showPersistentNotification = () => {
    notify.custom({
      type: 'info',
      title: 'Persistent Notification',
      message: 'This notification will stay until you dismiss it manually.',
      duration: 0, // Persistent
      dismissible: true
    });
  };

  const showClickableNotification = () => {
    notify.custom({
      type: 'success',
      title: 'Clickable Notification',
      message: 'Click this notification to trigger an action!',
      duration: 10000,
      onClick: () => {
        alert('Notification clicked! 🎉');
      }
    });
  };

  const showCustomNotification = () => {
    notify.custom({
      type: 'warning',
      title: customTitle,
      message: customMessage,
      duration: customDuration,
      dismissible: true
    });
  };

  const showMultipleNotifications = () => {
    notify.info('First', 'This is the first notification');
    setTimeout(() => notify.success('Second', 'This is the second notification'), 500);
    setTimeout(() => notify.warning('Third', 'This is the third notification'), 1000);
    setTimeout(() => notify.error('Fourth', 'This is the fourth notification'), 1500);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center justify-center space-x-2">
          <Bell className="w-8 h-8" />
          <span>Notification System Demo</span>
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Test the in-browser notification system with different types and configurations
        </p>
      </div>

      {/* Basic Notification Types */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
          <TestTube className="w-5 h-5" />
          <span>Basic Notification Types</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={showInfoNotification}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors font-medium"
          >
            Show Info
          </button>
          <button
            onClick={showSuccessNotification}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors font-medium"
          >
            Show Success
          </button>
          <button
            onClick={showWarningNotification}
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg transition-colors font-medium"
          >
            Show Warning
          </button>
          <button
            onClick={showErrorNotification}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors font-medium"
          >
            Show Error
          </button>
        </div>
      </div>

      {/* Advanced Features */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
          <Zap className="w-5 h-5" />
          <span>Advanced Features</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={showPersistentNotification}
            className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition-colors font-medium"
          >
            Persistent Notification
          </button>
          <button
            onClick={showClickableNotification}
            className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg transition-colors font-medium"
          >
            Clickable Notification
          </button>
          <button
            onClick={showMultipleNotifications}
            className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg transition-colors font-medium"
          >
            Multiple Notifications
          </button>
        </div>
      </div>

      {/* Custom Notification Builder */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
          <Settings className="w-5 h-5" />
          <span>Custom Notification Builder</span>
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Title
            </label>
            <input
              type="text"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter notification title"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Message
            </label>
            <textarea
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Enter notification message"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Duration (milliseconds)
            </label>
            <input
              type="number"
              value={customDuration}
              onChange={(e) => setCustomDuration(Number(e.target.value))}
              min="0"
              step="1000"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Duration in milliseconds (0 for persistent)"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Set to 0 for persistent notifications that require manual dismissal
            </p>
          </div>
          <button
            onClick={showCustomNotification}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-2 rounded-lg transition-all font-medium"
          >
            Show Custom Notification
          </button>
        </div>
      </div>

      {/* Usage Examples */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Usage Examples
        </h2>
        <div className="space-y-4 text-sm">
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Basic Usage:</h3>
            <pre className="text-gray-700 dark:text-gray-300 overflow-x-auto">
{`const notify = useNotify();

// Simple notifications
notify.success('Success!', 'Operation completed successfully');
notify.error('Error', 'Something went wrong');
notify.warning('Warning', 'Please check your input');
notify.info('Info', 'Here is some information');`}
            </pre>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Advanced Usage:</h3>
            <pre className="text-gray-700 dark:text-gray-300 overflow-x-auto">
{`// Custom notification with options
notify.custom({
  type: 'success',
  title: 'Custom Title',
  message: 'Custom message',
  duration: 10000, // 10 seconds
  dismissible: true,
  onClick: () => console.log('Clicked!'),
  onDismiss: () => console.log('Dismissed!')
});`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationDemo;
