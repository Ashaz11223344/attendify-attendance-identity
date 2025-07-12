import React, { useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Calendar, Clock, FileText, User, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const LeaveRequestHistory: React.FC = () => {
  const [limit, setLimit] = useState(20);
  const leaveRequests = useQuery(api.leaveRequests.getMyLeaveRequests, { limit });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-400" />;
      default:
        return <AlertCircle className="w-5 h-5 text-yellow-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-900/30 text-green-300 border-green-800';
      case 'rejected':
        return 'bg-red-900/30 text-red-300 border-red-800';
      default:
        return 'bg-yellow-900/30 text-yellow-300 border-yellow-800';
    }
  };

  if (!leaveRequests) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white flex items-center space-x-2">
          <FileText className="w-5 h-5" />
          <span>Leave Request History</span>
        </h2>
        <div className="text-sm text-gray-400">
          {leaveRequests.length} request{leaveRequests.length !== 1 ? 's' : ''}
        </div>
      </div>

      {leaveRequests.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-400 mb-2">No Leave Requests</h3>
          <p className="text-gray-500">You haven't submitted any leave requests yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {leaveRequests.map((request) => (
            <div
              key={request._id}
              className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 hover:bg-gray-800/70 transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(request.status)}
                  <div>
                    <h3 className="font-semibold text-white">
                      {request.subject?.name || 'General Leave Request'}
                    </h3>
                    <p className="text-sm text-gray-400">
                      {request.subject?.code && `${request.subject.code} • `}
                      {request.reason}
                    </p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(request.status)}`}>
                  {request.status.toUpperCase()}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="flex items-center space-x-2 text-sm text-gray-400">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {new Date(request.startDate).toLocaleDateString()} - {new Date(request.endDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-400">
                  <Clock className="w-4 h-4" />
                  <span>Submitted {new Date(request.submittedAt).toLocaleDateString()}</span>
                </div>
                {request.teacher && (
                  <div className="flex items-center space-x-2 text-sm text-gray-400">
                    <User className="w-4 h-4" />
                    <span>Teacher: {request.teacher.name}</span>
                  </div>
                )}
                {request.reviewedAt && (
                  <div className="flex items-center space-x-2 text-sm text-gray-400">
                    <Clock className="w-4 h-4" />
                    <span>Reviewed {new Date(request.reviewedAt).toLocaleDateString()}</span>
                  </div>
                )}
              </div>

              {request.description && (
                <div className="mb-4">
                  <p className="text-sm text-gray-300 bg-gray-900/50 rounded-lg p-3">
                    {request.description}
                  </p>
                </div>
              )}

              {request.reviewNotes && (
                <div className="border-t border-gray-700 pt-4">
                  <h4 className="text-sm font-medium text-gray-300 mb-2">Review Notes:</h4>
                  <p className="text-sm text-gray-400 bg-gray-900/50 rounded-lg p-3">
                    {request.reviewNotes}
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between text-xs text-gray-500 mt-4 pt-4 border-t border-gray-700">
                <div className="flex items-center space-x-4">
                  <span className={`flex items-center space-x-1 ${request.parentNotified ? 'text-green-400' : 'text-gray-500'}`}>
                    <div className={`w-2 h-2 rounded-full ${request.parentNotified ? 'bg-green-400' : 'bg-gray-500'}`}></div>
                    <span>Parent Notified</span>
                  </span>
                  <span className={`flex items-center space-x-1 ${request.teacherNotified ? 'text-green-400' : 'text-gray-500'}`}>
                    <div className={`w-2 h-2 rounded-full ${request.teacherNotified ? 'bg-green-400' : 'bg-gray-500'}`}></div>
                    <span>Teacher Notified</span>
                  </span>
                </div>
              </div>
            </div>
          ))}

          {leaveRequests.length >= limit && (
            <div className="text-center">
              <button
                onClick={() => setLimit(prev => prev + 20)}
                className="text-blue-400 hover:text-blue-300 text-sm font-medium"
              >
                Load More
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LeaveRequestHistory;
