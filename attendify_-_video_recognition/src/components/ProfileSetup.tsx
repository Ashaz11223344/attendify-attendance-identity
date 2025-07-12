import React, { useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { toast } from 'sonner';
import LoadingSpinner from './LoadingSpinner';
import { User, GraduationCap, UserCheck, Info } from 'lucide-react';

const ProfileSetup: React.FC = () => {
  const [role, setRole] = useState<'student' | 'teacher'>('student');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    studentId: '',
    teacherId: '',
    department: '',
    parentEmail: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createProfile = useMutation(api.userProfiles.createProfile);
  const createFirstAdminProfile = useMutation(api.userProfiles.createFirstAdminProfile);
  const hasAdminUsers = useQuery(api.userProfiles.hasAdminUsers);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!hasAdminUsers) {
        // First user becomes admin
        await createFirstAdminProfile({
          name: formData.name,
    
        });
        toast.success('Admin account created successfully!');
      } else {
        // Regular user creation
        await createProfile({
          role,
          name: formData.name,
          phoneNumber: formData.phone || undefined,
          studentId: role === 'student' ? formData.studentId : undefined,
  
          department: formData.department || undefined,
          parentEmail: role === 'student' ? formData.parentEmail || undefined : undefined,
        });
        toast.success('Profile created successfully! Please wait for admin approval.');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (hasAdminUsers === undefined) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Complete Your Profile
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {hasAdminUsers 
              ? "Please provide your information to get started. Your profile will need admin approval."
              : "Welcome! As the first user, you'll be automatically assigned admin privileges and can immediately access all system features."
            }
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Role Selection - Only show if not first user */}
          {hasAdminUsers && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Select Your Role
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setRole('student')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    role === 'student'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
                >
                  <div className="text-center">
                    <GraduationCap className="w-8 h-8 mx-auto mb-2 text-current" />
                    <span className="font-medium">Student</span>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('teacher')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    role === 'teacher'
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
                >
                  <div className="text-center">
                    <UserCheck className="w-8 h-8 mx-auto mb-2 text-current" />
                    <span className="font-medium">Teacher</span>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Basic Information */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          {/* Role-specific fields */}
          {hasAdminUsers && (
            <>
              {role === 'student' && (
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Student ID *
                    </label>
                    <input
                      type="text"
                      value={formData.studentId}
                      onChange={(e) => handleInputChange('studentId', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Parent Email
                    </label>
                    <input
                      type="email"
                      value={formData.parentEmail}
                      onChange={(e) => handleInputChange('parentEmail', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="For attendance notifications"
                    />
                  </div>
                </div>
              )}

              {role === 'teacher' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Teacher ID *
                  </label>
                  <input
                    type="text"
                    value={formData.teacherId}
                    onChange={(e) => handleInputChange('teacherId', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>
              )}
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Department
            </label>
            <input
              type="text"
              value={formData.department}
              onChange={(e) => handleInputChange('department', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="e.g., Computer Science, Mathematics"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || !formData.name || (hasAdminUsers && role === 'student' && !formData.studentId) || (hasAdminUsers && role === 'teacher' && !formData.teacherId)}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Creating Profile...</span>
              </div>
            ) : (
              hasAdminUsers ? 'Create Profile' : 'Setup Admin Account'
            )}
          </button>
        </form>

        {/* Information Box */}
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-start space-x-3">
            <Info className="w-5 h-5 text-blue-500 mt-0.5" />
            <div className="text-sm text-blue-800 dark:text-blue-300">
              {hasAdminUsers ? (
                <>
                  <p className="font-medium mb-1">Profile Approval Required</p>
                  <p>Your profile will be reviewed by an administrator before you can access the system. You'll receive a notification once it's approved.</p>
                </>
              ) : (
                <>
                  <p className="font-medium mb-1">First User Setup</p>
                  <p>As the first user in the system, you'll automatically receive administrator privileges and can immediately access all features.</p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSetup;
