import { useState, useEffect } from 'react';
import api from '../../lib/api';
import { Upload, FileText, Calendar, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { AxiosError } from 'axios';

interface Assignment {
  id: number;
  title: string;
  description: string;
  due_date: string;
  course_name: string;
  max_score?: number;
}

interface Submission {
  id: number;
  assignment_id: number;
  content: string;
  file_url: string;
  grade: number;
  status: string;
  submitted_at: string;
  feedback: string;
}

export default function AssignmentSubmission() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [submissionText, setSubmissionText] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssignments();
    fetchSubmissions();
  }, []);

  const fetchAssignments = async () => {
    try {
      const response = await api.get('/assignments');
      setAssignments(response.data as Assignment[]);
    } catch (error) {
      console.error('Error fetching assignments:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubmissions = async () => {
    try {
      const response = await api.get('/submissions/my-submissions');
      setSubmissions(response.data as Submission[]);
    } catch (error) {
      console.error('Error fetching submissions:', error);
    }
  };

  const submitAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssignment) return;

    try {
      const formData = new FormData();
      formData.append('content', submissionText);
      if (selectedFile) {
        formData.append('file', selectedFile);
      }

      await api.post(`/submissions/assignments/${selectedAssignment.id}/submit`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      await fetchSubmissions();
      setSelectedAssignment(null);
      setSubmissionText('');
      setSelectedFile(null);
      alert('Assignment submitted successfully!');
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        alert(error.response?.data?.error || 'Failed to submit assignment');
      } else {
        alert('Failed to submit assignment');
      }
    }
  };

  const getSubmissionStatus = (assignment: Assignment) => {
    const submission = submissions.find(s => s.assignment_id === assignment.id);
    if (!submission) return 'not_submitted';
    
    if (submission.grade !== null) return 'graded';
    return 'submitted';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'graded':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'submitted':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'graded':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'submitted':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
            <FileText className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Assignments</h1>
            <p className="text-gray-600">Submit your assignments and track your progress</p>
          </div>
        </div>
      </div>

      {/* Assignment List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Available Assignments</h2>
        
        {assignments.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600">No assignments available</p>
          </div>
        ) : (
          <div className="space-y-4">
            {assignments.map(assignment => {
              const status = getSubmissionStatus(assignment);
              const submission = submissions.find(s => s.assignment_id === assignment.id);
              const isOverdue = new Date(assignment.due_date) < new Date();

              return (
                <div key={assignment.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {getStatusIcon(status)}
                        <h3 className="text-xl font-semibold text-gray-900">{assignment.title}</h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(status)}`}>
                          {status.replace('_', ' ').toUpperCase()}
                        </span>
                        {isOverdue && status === 'not_submitted' && (
                          <span className="px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 border border-red-200">
                            OVERDUE
                          </span>
                        )}
                      </div>
                      
                      <p className="text-gray-600 mb-3">{assignment.description}</p>
                      
                      <div className="flex items-center gap-6 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>Due: {new Date(assignment.due_date).toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="font-medium">Course:</span> {assignment.course_name}
                        </div>
                        {assignment.max_score && (
                          <div>
                            <span className="font-medium">Max Score:</span> {assignment.max_score}
                          </div>
                        )}
                        {submission && submission.grade !== null && (
                          <div>
                            <span className="font-medium">Grade:</span> {submission.grade}/{assignment.max_score || 100}
                          </div>
                        )}
                      </div>

                      {submission && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-700">
                            <strong>Submitted:</strong> {new Date(submission.submitted_at).toLocaleString()}
                          </p>
                          {submission.feedback && (
                            <p className="text-sm text-gray-700 mt-1">
                              <strong>Feedback:</strong> {submission.feedback}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                    
                    {status === 'not_submitted' && (
                      <button
                        onClick={() => setSelectedAssignment(assignment)}
                        className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                      >
                        Submit
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Submission Modal */}
      {selectedAssignment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Submit Assignment</h2>
              <p className="text-gray-600 mb-6">{selectedAssignment.title}</p>
              
              <form onSubmit={submitAssignment} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Submission Text
                  </label>
                  <textarea
                    value={submissionText}
                    onChange={(e) => setSubmissionText(e.target.value)}
                    placeholder="Enter your submission text here..."
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 resize-none"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload File (Optional)
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-400 transition-colors">
                    <input
                      type="file"
                      onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                      className="hidden"
                      id="file-upload"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <span className="text-sm text-gray-600 block mb-1">
                        {selectedFile ? selectedFile.name : 'Click to upload file'}
                      </span>
                      <span className="text-xs text-gray-500">PDF, DOC, DOCX, TXT (Max 10MB)</span>
                    </label>
                  </div>
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold"
                  >
                    Submit Assignment
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedAssignment(null)}
                    className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}