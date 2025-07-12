import React, { useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useNotify } from '../common/NotificationSystem';
import { Calendar, Clock, FileText, Send, X } from 'lucide-react';

interface LeaveRequestFormProps {
  onClose: () => void;
}

const LeaveRequestForm: React.FC<LeaveRequestFormProps> = ({ onClose }) => {
  const [formData, setFormData] = useState({
    subjectId: '',
    teacherId: '',
    startDate: '',
    endDate: '',
    reason: '',
    description: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const subjects = useQuery(api.subjects.getMySubjects);
  const teachers = useQuery(api.userProfiles.getTeachers);
  const submitLeaveRequest = useMutation(api.leaveRequests.submitLeaveRequest);
  
  // Use the notification system
  const notify = useNotify();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.startDate || !formData.endDate || !formData.reason.trim()) {
      notify.error('Validation Error', 'Please fill in all required fields');
      return;
    }

    const startDate = new Date(formData.startDate).getTime();
    const endDate = new Date(formData.endDate).getTime();

    if (startDate >= endDate) {
      notify.error('Date Error', 'End date must be after start date');
      return;
    }

    if (startDate < Date.now() - 24 * 60 * 60 * 1000) {
      notify.error('Date Error', 'Start date cannot be in the past');
      return;
    }

    setIsSubmitting(true);

    try {
      await submitLeaveRequest({
        subjectId: formData.subjectId ? formData.subjectId as any : undefined,
        teacherId: formData.teacherId ? formData.teacherId as any : undefined,
        startDate,
        endDate,
        reason: formData.reason,
        description: formData.description || undefined,
      });

      // Show success notification with email confirmation
      notify.success(
        'Leave Request Submitted!',
        'Your leave request has been submitted successfully. Email notifications are being sent to your teacher and parent.',
        { duration: 6000 }
      );

      // Show additional notification about email process
      setTimeout(() => {
        notify.info(
          'Email Notifications Sent',
          'Both your teacher and parent have been notified via email about your leave request.',
          { duration: 4000 }
        );
      }, 2000);

      onClose();
    } catch (error) {
      notify.error('Submit Failed', 'Failed to submit leave request. Please try again.');
      console.error('Leave request error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <FileText className="w-5 h-5" />
            <span>Submit Leave Request</span>
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Subject Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Subject (Optional)
            </label>
            <select
              value={formData.subjectId}
              onChange={(e) => setFormData(prev => ({ ...prev, subjectId: e.target.value }))}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">General Leave Request</option>
              {subjects?.map((subject) => (
                <option key={subject._id} value={subject._id}>
                  {subject.name} ({subject.code})
                </option>
              ))}
            </select>
          </div>

          {/* Teacher Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Teacher (Optional)
            </label>
            <select
              value={formData.teacherId}
              onChange={(e) => setFormData(prev => ({ ...prev, teacherId: e.target.value }))}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select Teacher</option>
              {teachers?.map((teacher) => (
                <option key={teacher._id} value={teacher._id}>
                  {teacher.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Start Date *
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                End Date *
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                min={formData.startDate || new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Reason *
            </label>
            <select
              value={formData.reason}
              onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Select a reason</option>
              <option value="Medical">Medical</option>
              <option value="Family Emergency">Family Emergency</option>
              <option value="Personal">Personal</option>
              <option value="Religious">Religious</option>
              <option value="Travel">Travel</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Additional Details (Optional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Provide additional details about your leave request..."
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={3}
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-lg transition-colors font-medium flex items-center space-x-2"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? 'Submitting...' : 'Submit Request'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LeaveRequestForm;
