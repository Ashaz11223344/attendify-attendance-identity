import React, { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Doc } from "../../../convex/_generated/dataModel";
import LoadingWrapper from "../LoadingWrapper";
import ProfilePicture from "../common/ProfilePicture";

export default function StudentEnrollment() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [selected, setSelected] = useState<Doc<"userProfiles"> | null>(null);
  const students = useQuery(api.userProfiles.listStudents, { 
    status: status === "" ? undefined : status as "pending" | "approved" | "rejected"
  });

  const updateProfileStatus = useMutation(api.userProfiles.updateProfileStatus);

  const handleStatusUpdate = async (studentId: string, newStatus: "approved" | "rejected", notes?: string) => {
    try {
      await updateProfileStatus({
        profileId: studentId as any,
        status: newStatus,
      });
      setSelected(null);
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  return (
    <LoadingWrapper isLoading={students === undefined}>
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Student Enrollment</h2>
        <div className="mb-4 flex gap-2">
          <input
            className="border border-gray-300 dark:border-gray-600 rounded px-3 py-2 w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            placeholder="Search by name, ID, or email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="border border-gray-300 dark:border-gray-600 rounded px-2 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
        <div className="overflow-y-auto max-h-[60vh] border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800">
          {students && students.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              <div>No students found.</div>
            </div>
          ) : (
            <ul>
              {students?.map((student) => (
                <li
                  key={student._id}
                  className={`flex items-center gap-4 px-4 py-3 border-b border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors ${
                    selected?._id === student._id ? "bg-purple-50 dark:bg-purple-900/20" : ""
                  }`}
                  onClick={() => setSelected(student)}
                >
                  <ProfilePicture
                    storageId={student.profilePicture}
                    name={student.name}
                    size={48}
                  />
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900 dark:text-white">{student.name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{student.email}</div>
                    <div className="text-xs text-gray-400 dark:text-gray-500">{student.studentId}</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      student.status === "approved" 
                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                        : student.status === "pending"
                        ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                        : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                    }`}>
                      {student.status}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        {selected && (
          <StudentProfileModal 
            student={selected} 
            onClose={() => setSelected(null)}
            onStatusUpdate={handleStatusUpdate}
          />
        )}
      </div>
    </LoadingWrapper>
  );
}

// Profile modal with profile picture and status update actions
function StudentProfileModal({
  student,
  onClose,
  onStatusUpdate,
}: {
  student: Doc<"userProfiles">;
  onClose: () => void;
  onStatusUpdate: (studentId: string, status: "approved" | "rejected", notes?: string) => void;
}) {
  const [notes, setNotes] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusUpdate = async (status: "approved" | "rejected") => {
    setIsUpdating(true);
    try {
      await onStatusUpdate(student._id, status, notes);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-8 max-w-md w-full shadow-lg relative mx-4">
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 text-2xl"
          onClick={onClose}
        >
          ×
        </button>
        <div className="flex flex-col items-center gap-4">
          <ProfilePicture
            storageId={student.profilePicture}
            name={student.name}
            size={80}
            className="border-4 border-gray-200 dark:border-gray-600"
          />
          <div className="text-xl font-bold text-gray-900 dark:text-white">{student.name}</div>
          <div className="text-gray-500 dark:text-gray-400">{student.email}</div>
          <div className="text-gray-400 dark:text-gray-500">{student.studentId}</div>
          
          <div className="w-full mt-4">
            <div className="font-semibold text-gray-900 dark:text-white mb-2">Details</div>
            <div className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Status:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  student.status === "approved" 
                    ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                    : student.status === "pending"
                    ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                    : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                }`}>
                  {student.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Department:</span>
                <span>{student.department || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Phone:</span>
                <span>{student.phoneNumber || student.phone || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Parent Email:</span>
                <span>{student.parentEmail || "N/A"}</span>
              </div>
            </div>
          </div>

          {student.status === "pending" && (
            <div className="w-full mt-4 space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Notes (optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  rows={3}
                  placeholder="Add any notes about this decision..."
                />
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => handleStatusUpdate("approved")}
                  disabled={isUpdating}
                  className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  {isUpdating ? "Updating..." : "Approve"}
                </button>
                <button
                  onClick={() => handleStatusUpdate("rejected")}
                  disabled={isUpdating}
                  className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  {isUpdating ? "Updating..." : "Reject"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
