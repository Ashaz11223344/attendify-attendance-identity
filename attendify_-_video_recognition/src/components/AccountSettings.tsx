import React, { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { toast } from 'sonner';
import LoadingSpinner from './LoadingSpinner';
import ProfilePicture from './common/ProfilePicture';
import ImageCropper from './common/ImageCropper';

const AccountSettings: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showCropper, setShowCropper] = useState(false);
  const [selectedImageSrc, setSelectedImageSrc] = useState<string>('');
  const [formData, setFormData] = useState({
    name: '',
    department: '',
    phoneNumber: '',
    parentEmail: '',
  });

  const userProfile = useQuery(api.userProfiles.getCurrentUserProfile);
  const updateProfile = useMutation(api.userProfiles.updateProfile);
  const generateUploadUrl = useMutation(api.userProfiles.generateUploadUrl);
  const updateProfilePicture = useMutation(api.userProfiles.updateProfilePicture);
  const removeProfilePicture = useMutation(api.userProfiles.removeProfilePicture);

  React.useEffect(() => {
    if (userProfile && !isEditing) {
      setFormData({
        name: userProfile.name || '',
        department: userProfile.department || '',
        phoneNumber: userProfile.phoneNumber || '',
        parentEmail: userProfile.parentEmail || '',
      });
    }
  }, [userProfile, isEditing]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (userProfile) {
      setFormData({
        name: userProfile.name || '',
        department: userProfile.department || '',
        phoneNumber: userProfile.phoneNumber || '',
        parentEmail: userProfile.parentEmail || '',
      });
    }
  };

  const handleSave = async () => {
    try {
      await updateProfile(formData);
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
      console.error('Update error:', error);
    }
  };

  const handleProfilePictureSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    // Create image URL for cropper
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setSelectedImageSrc(e.target.result as string);
        setShowCropper(true);
      }
    };
    reader.readAsDataURL(file);

    // Reset input
    event.target.value = '';
  };

  const handleCropComplete = async (croppedBlob: Blob) => {
    setIsUploading(true);
    setShowCropper(false);

    try {
      // Get upload URL
      const uploadUrl = await generateUploadUrl();

      // Upload cropped image
      const result = await fetch(uploadUrl, {
        method: 'POST',
        headers: { 'Content-Type': croppedBlob.type },
        body: croppedBlob,
      });

      if (!result.ok) {
        throw new Error('Upload failed');
      }

      const { storageId } = await result.json();

      // Update profile with new picture
      await updateProfilePicture({ storageId });

      toast.success('Profile picture updated successfully');
    } catch (error) {
      toast.error('Failed to upload profile picture');
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveProfilePicture = async () => {
    if (!userProfile?.profilePicture) return;

    try {
      await removeProfilePicture();
      toast.success('Profile picture removed successfully');
    } catch (error) {
      toast.error('Failed to remove profile picture');
      console.error('Remove error:', error);
    }
  };

  if (!userProfile) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <>
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-8">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <ProfilePicture
                  storageId={userProfile.profilePicture}
                  name={userProfile.name}
                  size={80}
                />
                {isUploading && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
                
                {/* Profile Picture Controls */}
                <div className="absolute bottom-0 right-0 flex space-x-1">
                  <label className="bg-white dark:bg-gray-700 rounded-full p-2 shadow-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                    <svg className="w-4 h-4 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProfilePictureSelect}
                      className="hidden"
                      disabled={isUploading}
                    />
                  </label>
                  
                  {userProfile.profilePicture && (
                    <button
                      onClick={handleRemoveProfilePicture}
                      className="bg-red-500 hover:bg-red-600 rounded-full p-2 shadow-lg transition-colors"
                      title="Remove profile picture"
                    >
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
              <div className="text-white">
                <h1 className="text-2xl font-bold">{userProfile.name}</h1>
                <p className="text-blue-100 capitalize">{userProfile.role}</p>
                {userProfile.studentId && (
                  <p className="text-blue-100">ID: {userProfile.studentId}</p>
                )}
                <div className="flex items-center mt-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    userProfile.status === 'approved' 
                      ? 'bg-green-500 text-white' 
                      : userProfile.status === 'pending'
                      ? 'bg-yellow-500 text-white'
                      : 'bg-red-500 text-white'
                  }`}>
                    {userProfile.status === 'approved' ? '✓ Approved' : 
                     userProfile.status === 'pending' ? '⏳ Pending' : '✗ Rejected'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Information */}
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Profile Information
              </h2>
              {!isEditing ? (
                <button
                  onClick={handleEdit}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
                >
                  Edit Profile
                </button>
              ) : (
                <div className="flex space-x-3">
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium"
                  >
                    Save Changes
                  </button>
                </div>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                  Basic Information
                </h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Full Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  ) : (
                    <p className="text-gray-900 dark:text-white">{userProfile.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email
                  </label>
                  <p className="text-gray-900 dark:text-white">{userProfile.email}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Email cannot be changed</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Role
                  </label>
                  <p className="text-gray-900 dark:text-white capitalize">{userProfile.role}</p>
                </div>

                {userProfile.studentId && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Student ID
                    </label>
                    <p className="text-gray-900 dark:text-white">{userProfile.studentId}</p>
                  </div>
                )}
              </div>

              {/* Additional Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                  Additional Information
                </h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Department
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Enter your department"
                    />
                  ) : (
                    <p className="text-gray-900 dark:text-white">{userProfile.department || 'Not specified'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Phone Number
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={formData.phoneNumber}
                      onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Enter your phone number"
                    />
                  ) : (
                    <p className="text-gray-900 dark:text-white">{userProfile.phoneNumber || 'Not specified'}</p>
                  )}
                </div>

                {userProfile.role === 'student' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Parent Email
                    </label>
                    {isEditing ? (
                      <input
                        type="email"
                        value={formData.parentEmail}
                        onChange={(e) => setFormData({ ...formData, parentEmail: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Enter parent's email"
                      />
                    ) : (
                      <p className="text-gray-900 dark:text-white">{userProfile.parentEmail || 'Not specified'}</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Account Status */}
            {userProfile.status !== 'approved' && (
              <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                      Account Pending Approval
                    </h4>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                      Your account is currently pending approval from an administrator. You'll receive access once approved.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Image Cropper Modal */}
      {showCropper && (
        <ImageCropper
          imageSrc={selectedImageSrc}
          onCropComplete={handleCropComplete}
          onCancel={() => setShowCropper(false)}
        />
      )}
    </>
  );
};

export default AccountSettings;
