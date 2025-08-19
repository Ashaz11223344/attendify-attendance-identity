import React, { useState, useRef, useEffect } from 'react';
import { Download, Monitor, Smartphone, ChevronDown } from 'lucide-react';

const DownloadAppButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleDownload = (platform: 'windows' | 'android') => {
    if (platform === 'windows') {
      // Create download link for Windows installer
      const link = document.createElement('a');
      link.href = `https://github.com/Ashaz11223344/attendify-attendance-identity/releases/download/v1.0/AttendifySetup.exe`;
      link.download = 'Attendify-Setup.exe';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (platform === 'android') {
      // Open Android APK link in new tab
      window.open('https://github.com/Ashaz11223344/attendify-attendance-identity/releases/download/v1.0/attendify.apk', '_blank');
    }
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Main Download Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
      >
        <Download className="w-4 h-4" />
        <span>Download App</span>
        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full mt-2 right-0 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
          <div className="p-2">
            {/* Windows Option */}
            <button
              onClick={() => handleDownload('windows')}
              className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150 group"
            >
              <div className="flex-shrink-0 w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors">
                <Monitor className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1 text-left">
                <div className="font-medium text-gray-900 dark:text-white">
                  Download for Windows
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Desktop installer (.exe)
                </div>
              </div>
            </button>

            {/* Android Option */}
            <button
              onClick={() => handleDownload('android')}
              className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150 group"
            >
              <div className="flex-shrink-0 w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center group-hover:bg-green-200 dark:group-hover:bg-green-900/50 transition-colors">
                <Smartphone className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1 text-left">
                <div className="font-medium text-gray-900 dark:text-white">
                  Download for Android
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Mobile app (.apk)
                </div>
              </div>
            </button>
          </div>

          {/* Footer */}
          <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-600">
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
              Choose your platform to download Attendify
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DownloadAppButton;


