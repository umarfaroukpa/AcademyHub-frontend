import { useState, useEffect } from 'react';
import api from '../../lib/api';
import { FileText, Download, CheckCircle, Clock, User, BookOpen } from 'lucide-react';

interface Submission {
  id: number;
  student_id: number;
  student_name: string;
  assignment_id: number;
  assignment_title: string;
  course_name: string;
  content: string;
  file_url: string;
  grade: number | null;
  status: string;
  submitted_at: string;
  feedback: string;
}

export default function SubmissionGrading() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [gradingSubmission, setGradingSubmission] = useState<Submission | null>(null);
  const [grade, setGrade] = useState('');
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const response = await api.get('/submissions');
      setSubmissions(response.data as Submission[]);
    } catch (error) {
      console.error('Error fetching submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const gradeSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gradingSubmission) return;

    try {
      await api.put(`/submissions/${gradingSubmission.id}/grade`, {
        grade: parseFloat(grade),
        feedback: feedback
      });

      await fetchSubmissions();
      setGradingSubmission(null);
      setGrade('');
      setFeedback('');
      alert('Grade submitted successfully!');
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to submit grade');
    }
  };

  const downloadFile = (fileUrl: string, fileName: string) => {
    const link = document.createElement('a');
    link.href = `http://localhost:4000/uploads/${fileUrl}`;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
            <CheckCircle className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Grade Submissions</h1>
            <p className="text-gray-600">Review and grade student submissions</p>
          </div>
        </div>
      </div>

      {/* Submissions List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Student Submissions</h2>
        
        {submissions.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600">No submissions to grade</p>
          </div>
        ) : (
          <div className="space-y-4">
            {submissions.map(submission => (
              <div key={submission.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <FileText className="w-6 h-6 text-blue-600" />
                      <h3 className="text-xl font-semibold text-gray-900">{submission.assignment_title}</h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(submission.status)}`}>
                        {submission.status.toUpperCase()}
                      </span>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4 mb-3">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <User className="w-4 h-4" />
                        <span><strong>Student:</strong> {submission.student_name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <BookOpen className="w-4 h-4" />
                        <span><strong>Course:</strong> {submission.course_name}</span>
                      </div>
                    </div>

                    {submission.content && (
                      <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-700">
                          <strong>Submission:</strong> {submission.content}
                        </p>
                      </div>
                    )}

                    {submission.file_url && (
                      <div className="mb-3">
                        <button
                          onClick={() => downloadFile(submission.file_url, `submission-${submission.id}`)}
                          className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <Download className="w-4 h-4" />
                          Download Submitted File
                        </button>
                      </div>
                    )}

                    <div className="text-sm text-gray-600">
                      <strong>Submitted:</strong> {new Date(submission.submitted_at).toLocaleString()}
                    </div>

                    {submission.grade !== null && (
                      <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-green-700">
                          <strong>Grade:</strong> {submission.grade}/100
                        </p>
                        {submission.feedback && (
                          <p className="text-green-700 mt-1">
                            <strong>Feedback:</strong> {submission.feedback}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {submission.grade === null && (
                    <button
                      onClick={() => {
                        setGradingSubmission(submission);
                        setGrade('');
                        setFeedback('');
                      }}
                      className="ml-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
                    >
                      Grade
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Grading Modal */}
      {gradingSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Grade Submission</h2>
              <p className="text-gray-600 mb-6">
                {gradingSubmission.assignment_title} - {gradingSubmission.student_name}
              </p>
              
              <form onSubmit={gradeSubmission} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Grade (0-100)
                  </label>
                  <input
                    type="number"
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    min="0"
                    max="100"
                    step="0.1"
                    placeholder="Enter grade"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Feedback
                  </label>
                  <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Provide feedback to the student..."
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 resize-none"
                  />
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-semibold"
                  >
                    Submit Grade
                  </button>
                  <button
                    type="button"
                    onClick={() => setGradingSubmission(null)}
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