import React, { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Doc } from '../../../convex/_generated/dataModel';
import { toast } from 'sonner';
import LoadingWrapper from '../LoadingWrapper';
import { BookOpen, Building2 } from 'lucide-react';

interface SubjectManagementProps {
  profile: Doc<"userProfiles">;
}

const SubjectManagement: React.FC<SubjectManagementProps> = ({ profile }) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [showStudentAssignment, setShowStudentAssignment] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    department: '',
    teacherId: '',
  });

  const allSubjects = useQuery(api.subjects.getAllSubjects);
  const teachers = useQuery(api.userProfiles.getAllUsers, { role: 'teacher', status: 'approved' });
  const students = useQuery(api.userProfiles.searchProfiles, 
    searchQuery.length > 0 ? { query: searchQuery, role: 'student' } : 'skip'
  );
  const enrolledStudents = useQuery(api.subjects.getEnrolledStudents, 
    selectedSubject ? { subjectId: selectedSubject as any } : 'skip'
  );

  const createSubject = useMutation(api.subjects.createSubject);
  const updateSubject = useMutation(api.subjects.updateSubject);
  const assignTeacher = useMutation(api.subjects.assignTeacher);
  const enrollStudent = useMutation(api.subjects.enrollStudent);
  const removeStudentFromSubject = useMutation(api.subjects.removeStudentFromSubject);

  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createSubject({
        name: formData.name,
        code: formData.code,
        description: formData.description || undefined,
        department: formData.department || undefined,
        teacherId: formData.teacherId as any,
      });
      toast.success('Subject created successfully!');
      setFormData({ name: '', code: '', description: '', department: '', teacherId: '' });
      setShowCreateForm(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create subject');
    }
  };

  const handleAssignTeacher = async (subjectId: string, teacherId: string) => {
    try {
      await assignTeacher({
        subjectId: subjectId as any,
        teacherId: teacherId as any,
      });
      toast.success('Teacher assigned successfully!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to assign teacher');
    }
  };

  const handleEnrollStudent = async (studentId: string) => {
    if (!selectedSubject) return;
    try {
      await enrollStudent({
        studentId: studentId as any,
        subjectId: selectedSubject as any,
      });
      toast.success('Student enrolled successfully!');
      setSearchQuery('');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to enroll student');
    }
  };

  const handleRemoveStudent = async (enrollmentId: string) => {
    try {
      await removeStudentFromSubject({
        enrollmentId: enrollmentId as any,
      });
      toast.success('Student removed successfully!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to remove student');
    }
  };

  return (
    <LoadingWrapper isLoading={allSubjects === undefined || teachers === undefined}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Subject Management
          </h3>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Create Subject
          </button>
        </div>

        {/* Create Subject Form */}
        {showCreateForm && (
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Create New Subject
            </h4>
            <form onSubmit={handleCreateSubject} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Subject Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Subject Code *
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="e.g., CS101"
                    required
                  />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Department
                  </label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="e.g., Computer Science"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Assign Teacher
                  </label>
                  <select
                    value={formData.teacherId}
                    onChange={(e) => setFormData(prev => ({ ...prev, teacherId: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Select Teacher (Optional)</option>
                    {teachers?.map((teacher: any) => (
                      <option key={teacher._id} value={teacher._id}>
                        {teacher.name} ({teacher.department || 'No Dept'})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  rows={3}
                  placeholder="Subject description..."
                />
              </div>
              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Create Subject
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Subjects List */}
        <div className="grid gap-6">
          {allSubjects && allSubjects.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-gray-500 dark:text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No Subjects Created
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Create your first subject to get started.
              </p>
            </div>
          ) : (
            allSubjects?.map((subject) => (
              <div
                key={subject._id}
                className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 border border-gray-200 dark:border-gray-600"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold">
                          {subject.code.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {subject.name}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Code: {subject.code}
                        </p>
                      </div>
                    </div>
                    {subject.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {subject.description}
                      </p>
                    )}
                    <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                      {subject.department && (
                        <span className="flex items-center space-x-1">
                          <Building2 className="w-3 h-3" />
                          <span>{subject.department}</span>
                        </span>
                      )}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        subject.isActive
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
                      }`}>
                        {subject.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setSelectedSubject(subject._id);
                        setShowStudentAssignment(true);
                      }}
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm transition-colors"
                    >
                      Manage Students
                    </button>
                  </div>
                </div>

                {/* Teacher Assignment */}
                <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Assigned Teacher:
                      </p>
                      {subject.teacher ? (
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {subject.teacher.name} ({subject.teacher.department || 'No Dept'})
                        </p>
                      ) : (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          No teacher assigned
                        </p>
                      )}
                    </div>
                    <select
                      value={subject.teacherId || ''}
                      onChange={(e) => handleAssignTeacher(subject._id, e.target.value)}
                      className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                    >
                      <option value="">Unassigned</option>
                      {teachers?.map((teacher: any) => (
                        <option key={teacher._id} value={teacher._id}>
                          {teacher.name} ({teacher.department || 'No Dept'})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Student Assignment Modal */}
        {showStudentAssignment && selectedSubject && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Manage Students - {allSubjects?.find(s => s._id === selectedSubject)?.name}
                </h3>
                <button
                  onClick={() => {
                    setShowStudentAssignment(false);
                    setSelectedSubject(null);
                    setSearchQuery('');
                  }}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  ✕
                </button>
              </div>

              {/* Search Students */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Search Students to Enroll
                </label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Search by name or student ID..."
                />
                {students && students.length > 0 && (
                  <div className="mt-2 max-h-40 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-lg">
                    {students.map((student: any) => (
                      <div
                        key={student._id}
                        className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-600 last:border-b-0"
                      >
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {student.name}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            ID: {student.studentId} • {student.department}
                          </p>
                        </div>
                        <button
                          onClick={() => handleEnrollStudent(student._id)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors"
                        >
                          Enroll
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Enrolled Students */}
              <div>
                <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">
                  Enrolled Students ({enrolledStudents?.length || 0})
                </h4>
                {enrolledStudents && enrolledStudents.length > 0 ? (
                  <div className="space-y-2">
                    {enrolledStudents.map((student: any) => (
                      <div
                        key={student._id}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-sm">
                              {student.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {student.name}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              ID: {student.studentId} • {student.department}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveStudent(student.enrollmentId)}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600 dark:text-gray-400 text-center py-4">
                    No students enrolled in this subject yet.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </LoadingWrapper>
  );
};

export default SubjectManagement;
