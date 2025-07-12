import React, { useState } from 'react';
import { useQuery, useMutation, useAction } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Doc } from '../../../convex/_generated/dataModel';
import { toast } from 'sonner';
import LoadingWrapper from '../LoadingWrapper';

interface StudentFaceDataManagerProps {
  subjectId: string;
  teacherProfile: Doc<"userProfiles">;
}

const StudentFaceDataManager: React.FC<StudentFaceDataManagerProps> = ({ 
  subjectId, 
  teacherProfile 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);

  const enrolledStudents = useQuery(api.subjects.getEnrolledStudents, { 
    subjectId: subjectId as any 
  });
  const searchResults = useQuery(
    api.userProfiles.searchProfiles,
    searchQuery.length >= 2 ? { query: searchQuery, role: 'student' } : 'skip'
  );
  
  const enrollStudent = useMutation(api.subjects.enrollStudent);

  const handleEnrollStudent = async (studentId: string) => {
    try {
      await enrollStudent({
        studentId: studentId as any,
        subjectId: subjectId as any,
      });
      toast.success('Student enrolled successfully!');
      setShowAddStudent(false);
      setSearchQuery('');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to enroll student');
    }
  };

  return (
    <LoadingWrapper isLoading={enrolledStudents === undefined}>
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Student Face Data Management
          </h3>
          <button
            onClick={() => setShowAddStudent(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
          >
            <span>➕</span>
            <span>Add Student</span>
          </button>
        </div>

        {/* Enrolled Students List */}
        <div className="space-y-4">
          {enrolledStudents && enrolledStudents.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">👥</span>
              </div>
              <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No Students Enrolled
              </h4>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Add students to this subject to set up their face recognition data.
              </p>
              <button
                onClick={() => setShowAddStudent(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Add Your First Student
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {enrolledStudents?.map((student) => (
                <div
                  key={student._id}
                  className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">
                        {student.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {student.name}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        ID: {student.studentId}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Face Data:
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        student.faceEncodingData
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                          : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                      }`}>
                        {student.faceEncodingData ? '✅ Ready' : '❌ Missing'}
                      </span>
                    </div>

                    {!student.faceEncodingData && (
                      <button
                        onClick={() => setSelectedStudent(student)}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm transition-colors"
                      >
                        Setup Face Data
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Student Modal */}
        {showAddStudent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Add Student to Subject
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Search Students
                  </label>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Search by name or student ID..."
                  />
                </div>

                {/* Search Results */}
                {searchResults && searchResults.length > 0 && (
                  <div className="max-h-60 overflow-y-auto space-y-2">
                    {searchResults.map((student: any) => (
                      <div
                        key={student._id}
                        className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-600 rounded-lg"
                      >
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {student.name}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            ID: {student.studentId}
                          </p>
                        </div>
                        <button
                          onClick={() => handleEnrollStudent(student._id)}
                          className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-sm transition-colors"
                        >
                          Add
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {searchQuery.length >= 2 && searchResults && searchResults.length === 0 && (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                    No students found matching "{searchQuery}"
                  </p>
                )}

                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => {
                      setShowAddStudent(false);
                      setSearchQuery('');
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Face Data Setup Modal */}
        {selectedStudent && (
          <FaceDataSetupModal
            student={selectedStudent}
            onClose={() => setSelectedStudent(null)}
          />
        )}
      </div>
    </LoadingWrapper>
  );
};

// Face Data Setup Modal Component
const FaceDataSetupModal: React.FC<{
  student: any;
  onClose: () => void;
}> = ({ student, onClose }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  const generateUploadUrl = useMutation(api.faceRecognition.generateFacePhotoUploadUrl);
  const processFacePhoto = useAction(api.faceRecognition.processFacePhoto);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
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

    setIsProcessing(true);

    try {
      // Generate upload URL
      const uploadUrl = await generateUploadUrl();

      // Upload the file
      const uploadResponse = await fetch(uploadUrl, {
        method: 'POST',
        headers: { 'Content-Type': file.type },
        body: file,
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload image');
      }

      const { storageId } = await uploadResponse.json();

      // Process the face photo
      const result = await processFacePhoto({
        studentId: student._id,
        imageStorageId: storageId,
      });

      if (result.success) {
        toast.success('Face data processed successfully!');
        setUploadedImage(URL.createObjectURL(file));
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        toast.error('Failed to process face data');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to process image');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-lg mx-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Setup Face Data for {student.name}
        </h3>
        
        <div className="space-y-4">
          {/* Student Info */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">
                  {student.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {student.name}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Student ID: {student.studentId}
                </p>
              </div>
            </div>
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Upload Face Photo
            </label>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
              {uploadedImage ? (
                <div className="space-y-3">
                  <img
                    src={uploadedImage}
                    alt="Uploaded face"
                    className="w-32 h-32 object-cover rounded-lg mx-auto"
                  />
                  <p className="text-green-600 dark:text-green-400 font-medium">
                    ✅ Face data processed successfully!
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-600 rounded-full flex items-center justify-center mx-auto">
                    <span className="text-2xl">📷</span>
                  </div>
                  <div>
                    <label className="cursor-pointer">
                      <span className="text-blue-600 hover:text-blue-700 font-medium">
                        Click to upload
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                        disabled={isProcessing}
                      />
                    </label>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      PNG, JPG up to 5MB
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Processing Indicator */}
          {isProcessing && (
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span className="text-blue-800 dark:text-blue-300">
                  Processing face data...
                </span>
              </div>
            </div>
          )}

          {/* Guidelines */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 border border-yellow-200 dark:border-yellow-800">
            <h4 className="font-medium text-yellow-800 dark:text-yellow-300 mb-2">
              📋 Photo Guidelines
            </h4>
            <ul className="text-sm text-yellow-700 dark:text-yellow-400 space-y-1">
              <li>• Clear, front-facing photo</li>
              <li>• Good lighting, no shadows</li>
              <li>• No sunglasses or face coverings</li>
              <li>• Single person in the image</li>
            </ul>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              disabled={isProcessing}
            >
              {uploadedImage ? 'Done' : 'Cancel'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentFaceDataManager;
