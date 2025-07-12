import React from 'react';
import { useTheme } from './ThemeProvider';
import { Moon } from 'lucide-react';

const ThemeToggle: React.FC = () => {
  const { theme, actualTheme } = useTheme();

  return (
    <div className="flex items-center">
      <div className="w-8 h-8 bg-gray-800 dark:bg-gray-700 rounded-lg flex items-center justify-center border border-gray-600 dark:border-gray-600">
        <Moon className="w-4 h-4 text-yellow-400" />
      </div>
    </div>
  );
};

export default ThemeToggle;
