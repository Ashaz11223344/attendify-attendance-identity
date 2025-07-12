import React, { useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Doc } from '../../../convex/_generated/dataModel';
import LoadingSpinner from '../LoadingSpinner';

interface StudentManagementProps {
  profile: Doc<"userProfiles">;
}

const StudentManagement: React.FC<StudentManagementProps> = ({ profile }) => {
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  
  const mySubjects = useQuery(api.subjects.getMySubjects);
  const enrolledStudents = useQuery(
    api.subjects.getEnrolledStudents,
    selectedSubject ? { subjectId: selectedSubject as any } : 'skip'
  );

  if (mySubjects === undefined) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
        Student Management
      </h2>

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
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-600 hover:border-blue-300'
              }`}
            >
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mx-auto mb-2">
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

      {/* Students List */}
      {selectedSubject && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Enrolled Students
          </h3>
          
          {enrolledStudents === undefined ? (
            <div className="flex items-center justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : enrolledStudents.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">👥</span>
              </div>
              <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No Students Enrolled
              </h4>
              <p className="text-gray-600 dark:text-gray-400">
                Students will appear here once they are enrolled in this subject.
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {enrolledStudents.map((student) => (
                <div
                  key={student._id}
                  className="border border-gray-200 dark:border-gray-600 rounded-lg p-4"
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

                  <div className="space-y-2 text-sm">
                    {student.department && (
                      <div className="flex items-center text-gray-600 dark:text-gray-400">
                        <span className="mr-2">🏢</span>
                        <span>{student.department}</span>
                      </div>
                    )}
                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                      <span className="mr-2">📅</span>
                      <span>
                        Enrolled: {new Date(student.enrolledAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
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
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StudentManagement;
