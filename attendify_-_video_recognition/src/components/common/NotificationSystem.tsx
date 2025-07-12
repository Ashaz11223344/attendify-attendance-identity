import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';

// Notification types and interfaces
export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface NotificationConfig {
  id?: string;
  type: NotificationType;
  title: string;
  message: string;
  duration?: number; // in milliseconds, 0 for persistent
  dismissible?: boolean;
  onClick?: () => void;
  onDismiss?: () => void;
}

interface Notification extends Required<Omit<NotificationConfig, 'onClick' | 'onDismiss'>> {
  onClick?: () => void;
  onDismiss?: () => void;
  timestamp: number;
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (config: NotificationConfig) => string;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

// Context
const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Hook to use notifications
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

// Notification item component
const NotificationItem: React.FC<{
  notification: Notification;
  onRemove: (id: string) => void;
}> = ({ notification, onRemove }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  useEffect(() => {
    // Fade in animation
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Auto dismiss
    if (notification.duration > 0) {
      const timer = setTimeout(() => {
        handleDismiss();
      }, notification.duration);
      return () => clearTimeout(timer);
    }
  }, [notification.duration]);

  const handleDismiss = useCallback(() => {
    if (isRemoving) return;
    
    setIsRemoving(true);
    setIsVisible(false);
    
    // Wait for fade out animation
    setTimeout(() => {
      onRemove(notification.id);
      notification.onDismiss?.();
    }, 300);
  }, [notification.id, notification.onDismiss, onRemove, isRemoving]);

  const handleClick = useCallback(() => {
    if (notification.onClick) {
      notification.onClick();
      handleDismiss();
    }
  }, [notification.onClick, handleDismiss]);

  // Icon mapping
  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return <CheckCircle className="w-5 h-5" />;
      case 'error':
        return <AlertCircle className="w-5 h-5" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5" />;
      case 'info':
      default:
        return <Info className="w-5 h-5" />;
    }
  };

  // Color scheme mapping
  const getColorClasses = () => {
    switch (notification.type) {
      case 'success':
        return {
          container: 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800',
          icon: 'text-green-600 dark:text-green-400',
          title: 'text-green-800 dark:text-green-200',
          message: 'text-green-700 dark:text-green-300',
          button: 'text-green-500 hover:text-green-600 dark:text-green-400 dark:hover:text-green-300'
        };
      case 'error':
        return {
          container: 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800',
          icon: 'text-red-600 dark:text-red-400',
          title: 'text-red-800 dark:text-red-200',
          message: 'text-red-700 dark:text-red-300',
          button: 'text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300'
        };
      case 'warning':
        return {
          container: 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800',
          icon: 'text-yellow-600 dark:text-yellow-400',
          title: 'text-yellow-800 dark:text-yellow-200',
          message: 'text-yellow-700 dark:text-yellow-300',
          button: 'text-yellow-500 hover:text-yellow-600 dark:text-yellow-400 dark:hover:text-yellow-300'
        };
      case 'info':
      default:
        return {
          container: 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800',
          icon: 'text-blue-600 dark:text-blue-400',
          title: 'text-blue-800 dark:text-blue-200',
          message: 'text-blue-700 dark:text-blue-300',
          button: 'text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300'
        };
    }
  };

  const colors = getColorClasses();

  return (
    <div
      className={`
        relative max-w-sm w-full border rounded-lg shadow-lg p-4 mb-3
        transform transition-all duration-300 ease-in-out
        ${isVisible && !isRemoving ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
        ${colors.container}
        ${notification.onClick ? 'cursor-pointer hover:shadow-xl' : ''}
      `}
      onClick={notification.onClick ? handleClick : undefined}
      role="alert"
      aria-live="polite"
      aria-atomic="true"
    >
      <div className="flex items-start space-x-3">
        {/* Icon */}
        <div className={`flex-shrink-0 ${colors.icon}`}>
          {getIcon()}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h4 className={`text-sm font-semibold ${colors.title}`}>
            {notification.title}
          </h4>
          <p className={`text-sm mt-1 ${colors.message}`}>
            {notification.message}
          </p>
        </div>

        {/* Dismiss button */}
        {notification.dismissible && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDismiss();
            }}
            className={`
              flex-shrink-0 p-1 rounded-md transition-colors
              ${colors.button}
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
            `}
            aria-label="Dismiss notification"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Progress bar for timed notifications */}
      {notification.duration > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/10 dark:bg-white/10 rounded-b-lg overflow-hidden">
          <div
            className={`h-full notification-progress ${
              notification.type === 'success' ? 'bg-green-500' :
              notification.type === 'error' ? 'bg-red-500' :
              notification.type === 'warning' ? 'bg-yellow-500' :
              'bg-blue-500'
            }`}
            style={{
              '--duration': `${notification.duration}ms`
            } as React.CSSProperties}
          />
        </div>
      )}
    </div>
  );
};

// Notification container component
const NotificationContainer: React.FC<{
  notifications: Notification[];
  onRemove: (id: string) => void;
}> = ({ notifications, onRemove }) => {
  if (notifications.length === 0) return null;

  return (
    <div
      className="fixed top-4 right-4 z-50 space-y-2"
      role="region"
      aria-label="Notifications"
    >
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onRemove={onRemove}
        />
      ))}
    </div>
  );
};

// Provider component
export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((config: NotificationConfig): string => {
    const id = config.id || `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const notification: Notification = {
      id,
      type: config.type,
      title: config.title,
      message: config.message,
      duration: config.duration ?? 5000, // Default 5 seconds
      dismissible: config.dismissible ?? true,
      onClick: config.onClick,
      onDismiss: config.onDismiss,
      timestamp: Date.now(),
    };

    setNotifications(prev => [...prev, notification]);
    return id;
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const contextValue: NotificationContextType = {
    notifications,
    addNotification,
    removeNotification,
    clearAll,
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
      <NotificationContainer
        notifications={notifications}
        onRemove={removeNotification}
      />

    </NotificationContext.Provider>
  );
};

// Convenience hook for common notification patterns
export const useNotify = () => {
  const { addNotification } = useNotifications();

  return {
    info: (title: string, message: string, options?: Partial<NotificationConfig>) =>
      addNotification({ type: 'info', title, message, ...options }),
    
    success: (title: string, message: string, options?: Partial<NotificationConfig>) =>
      addNotification({ type: 'success', title, message, ...options }),
    
    warning: (title: string, message: string, options?: Partial<NotificationConfig>) =>
      addNotification({ type: 'warning', title, message, ...options }),
    
    error: (title: string, message: string, options?: Partial<NotificationConfig>) =>
      addNotification({ type: 'error', title, message, ...options }),
    
    custom: (config: NotificationConfig) => addNotification(config),
  };
};
