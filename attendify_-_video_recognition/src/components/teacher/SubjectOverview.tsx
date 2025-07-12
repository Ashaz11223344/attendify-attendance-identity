import React from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Doc } from '../../../convex/_generated/dataModel';
import LoadingSpinner from '../LoadingSpinner';
import { BookOpen } from 'lucide-react';

interface SubjectOverviewProps {
  profile: Doc<"userProfiles">;
}

const SubjectOverview: React.FC<SubjectOverviewProps> = ({ profile }) => {
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
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
        My Subjects
      </h2>

      {mySubjects.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 border border-gray-200 dark:border-gray-700 text-center">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-gray-500 dark:text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No Subjects Assigned
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Contact your administrator to get subjects assigned to you.
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mySubjects.map((subject) => (
            <div
              key={subject._id}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">
                    {subject.code.charAt(0)}
                  </span>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  subject.isActive
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
                }`}>
                  {subject.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {subject.name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Code: {subject.code}
              </p>

              {subject.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {subject.description}
                </p>
              )}

              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <span className="mr-2">📅</span>
                  <span>
                    Daily
                  </span>
                </div>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <span className="mr-2">🕐</span>
                  <span>
                    As scheduled
                  </span>
                </div>
                {subject.department && (
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <span className="mr-2">🏢</span>
                    <span>{subject.department}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SubjectOverview;
