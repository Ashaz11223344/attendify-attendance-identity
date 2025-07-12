import React, { useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Doc } from '../../../convex/_generated/dataModel';
import LoadingSpinner from '../LoadingSpinner';
import StudentFaceDataManager from './StudentFaceDataManager';

interface FaceRecognitionSetupProps {
  profile: Doc<"userProfiles">;
}

const FaceRecognitionSetup: React.FC<FaceRecognitionSetupProps> = ({ profile }) => {
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  
  const mySubjects = useQuery(api.subjects.getMySubjects);

  if (mySubjects === undefined) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Face Recognition Setup</h2>
        <p className="text-purple-100">
          Manage student face data for automated attendance tracking
        </p>
      </div>

      {/* Subject Selection */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Select Subject
        </h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mySubjects.map((subject) => (
            <button
              key={subject._id}
              onClick={() => setSelectedSubject(subject._id)}
              className={`p-4 rounded-lg border-2 transition-all ${
                selectedSubject === subject._id
                  ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                  : 'border-gray-200 dark:border-gray-600 hover:border-purple-300'
              }`}
            >
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <span className="text-2xl">📚</span>
                </div>
                <h4 className="font-medium text-gray-900 dark:text-white">
                  {subject.name}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {subject.code}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Student Face Data Management */}
      {selectedSubject && (
        <StudentFaceDataManager 
          subjectId={selectedSubject}
          teacherProfile={profile}
        />
      )}

      {/* Information Panel */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-300 mb-4">
          📋 Face Recognition Guidelines
        </h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-blue-800 dark:text-blue-400 mb-2">
              Photo Requirements
            </h4>
            <ul className="text-sm text-blue-700 dark:text-blue-500 space-y-1">
              <li>• Clear, front-facing photo</li>
              <li>• Good lighting conditions</li>
              <li>• No sunglasses or masks</li>
              <li>• Single person in frame</li>
              <li>• High resolution (min 640x480)</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-blue-800 dark:text-blue-400 mb-2">
              Security Features
            </h4>
            <ul className="text-sm text-blue-700 dark:text-blue-500 space-y-1">
              <li>• Anti-spoofing detection</li>
              <li>• Liveness verification</li>
              <li>• Encrypted face data storage</li>
              <li>• Confidence scoring</li>
              <li>• Audit trail logging</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FaceRecognitionSetup;
