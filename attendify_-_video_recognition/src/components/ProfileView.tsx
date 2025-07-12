import React from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Doc, Id } from '../../convex/_generated/dataModel';
import LoadingSpinner from './LoadingSpinner';

interface ProfileViewProps {
  profileId: Id<"userProfiles">;
  onClose: () => void;
}

const ProfileView: React.FC<ProfileViewProps> = ({ profileId, onClose }) => {
  const profile = useQuery(api.userProfiles.getProfileById, { profileId });

  if (profile === undefined) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4">
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner />
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4">
          <div className="text-center py-8">
            <p className="text-gray-600 dark:text-gray-400">Profile not found</p>
            <button
              onClick={onClose}
              className="mt-4 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'teacher':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      case 'student':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Profile Details
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            ✕
          </button>
        </div>

        {/* Profile Picture and Basic Info */}
        <div className="text-center mb-6">
          <div className="relative inline-block">
            {profile.profilePicture ? (
              <ProfilePictureDisplay storageId={profile.profilePicture} size={80} />
            ) : (
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto">
                <span className="text-white font-bold text-2xl">
                  {profile.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
          <h4 className="text-xl font-semibold text-gray-900 dark:text-white mt-3">
            {profile.name}
          </h4>
          <div className="flex items-center justify-center space-x-2 mt-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(profile.role)}`}>
              {profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
            </span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(profile.status)}`}>
              {profile.status.charAt(0).toUpperCase() + profile.status.slice(1)}
            </span>
          </div>
        </div>

        {/* Profile Details */}
        <div className="space-y-4">
          {profile.email && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email
              </label>
              <p className="text-gray-900 dark:text-white text-sm">{profile.email}</p>
            </div>
          )}

          {profile.phoneNumber && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Phone Number
              </label>
              <p className="text-gray-900 dark:text-white text-sm">{profile.phoneNumber}</p>
            </div>
          )}

          {profile.department && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Department
              </label>
              <p className="text-gray-900 dark:text-white text-sm">{profile.department}</p>
            </div>
          )}

          {profile.studentId && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Student ID
              </label>
              <p className="text-gray-900 dark:text-white text-sm">{profile.studentId}</p>
            </div>
          )}

          {profile.teacherId && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Teacher ID
              </label>
              <p className="text-gray-900 dark:text-white text-sm">{profile.teacherId}</p>
            </div>
          )}

          {profile.parentEmail && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Parent Email
              </label>
              <p className="text-gray-900 dark:text-white text-sm">{profile.parentEmail}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Member Since
            </label>
            <p className="text-gray-900 dark:text-white text-sm">
              {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'Unknown'}
            </p>
          </div>
        </div>

        {/* Close Button */}
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="w-full bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// Profile picture display component
function ProfilePictureDisplay({ storageId, size = 80 }: { storageId: Id<'_storage'>, size?: number }) {
  const url = useQuery(api.userProfiles.getProfilePictureUrl, { profilePictureId: storageId });
  if (!url) {
    return (
      <div 
        className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        <span className="text-white font-bold" style={{ fontSize: size / 2.5 }}>?</span>
      </div>
    );
  }
  return (
    <img
      src={url}
      alt="Profile"
      className="rounded-full object-cover"
      style={{ width: size, height: size }}
    />
  );
}

export default ProfileView;
