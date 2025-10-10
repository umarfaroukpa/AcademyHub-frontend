import { useState, useEffect } from 'react';
import { Course, Assignment, Submission } from '../../types/types';
import api from '../../lib/api';
import { BookOpen, Plus, Upload, Sparkles, FileText } from 'lucide-react';

interface AssignmentResponse {
  id: number;
  title: string;
  description: string;
}

export default function LecturerDashboard() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [assignments, setAssignments] = useState<AssignmentResponse[]>([]);
  const [syllabusTopic, setSyllabusTopic] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    const response = await api.get('/courses');
    setCourses(response.data as Course[]);
  };

  const createCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    await api.post('/courses', {
      title: formData.get('title'),
      description: formData.get('description')
    });
    fetchCourses();
    setShowCreateForm(false);
  };

  const uploadSyllabus = async (courseId: number, file: File) => {
    const formData = new FormData();
    formData.append('syllabus', file);
    await api.post(`/courses/${courseId}/syllabus`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  };

  const generateSyllabus = async () => {
    const response = await api.post('/ai/syllabus', { topic: syllabusTopic });
    console.log('Generated syllabus:', response.data);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Lecturer Dashboard</h1>
            <p className="text-gray-600">Manage your courses and track student progress</p>
          </div>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all font-semibold"
          >
            <Plus className="w-5 h-5" />
            Create Course
          </button>
        </div>
      </div>

      {/* Create Course Form */}
      {showCreateForm && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Create New Course</h2>
          <form onSubmit={createCourse} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Course Title</label>
              <input
                name="title"
                placeholder="e.g., Introduction to Computer Science"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                name="description"
                placeholder="Provide a brief description of the course..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors resize-none"
                required
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold"
              >
                Create Course
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-semibold"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* AI Syllabus Generator */}
      <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl shadow-sm border border-purple-200 p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">AI Syllabus Generator</h2>
            <p className="text-gray-600 mb-4">Let AI help you create a comprehensive course syllabus</p>
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Enter course topic (e.g., Data Structures and Algorithms)..."
                value={syllabusTopic}
                onChange={(e) => setSyllabusTopic(e.target.value)}
                className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 transition-colors bg-white"
              />
              <button
                onClick={generateSyllabus}
                className="px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors font-semibold flex items-center gap-2"
              >
                <Sparkles className="w-5 h-5" />
                Generate
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* My Courses */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">My Courses</h2>
        {courses.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No courses yet</h3>
            <p className="text-gray-600 mb-6">Create your first course to get started</p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold"
            >
              <Plus className="w-5 h-5" />
              Create Your First Course
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {courses.map(course => (
              <div key={course.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all">
                {/* Course Header */}
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6">
                  <h3 className="text-xl font-bold text-white mb-2">{course.title}</h3>
                  <p className="text-blue-100 text-sm">{course.description}</p>
                </div>

                {/* Course Content */}
                <div className="p-6 space-y-4">
                  {/* Syllabus Section */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-gray-600" />
                        Course Syllabus
                      </h4>
                    </div>
                    
                    {course.syllabus_url ? (
                      <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-xl">
                        <span className="text-sm text-green-700 font-medium">Syllabus uploaded</span>
                        <a
                          href={`http://localhost:4000/uploads/${course.syllabus_url}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-green-600 hover:text-green-700 font-semibold"
                        >
                          View →
                        </a>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:border-blue-400 transition-colors">
                        <label className="cursor-pointer">
                          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          <span className="text-sm text-gray-600 block mb-1">Upload syllabus</span>
                          <span className="text-xs text-gray-500">PDF or DOCX</span>
                          <input
                            type="file"
                            accept=".pdf,.docx"
                            onChange={(e) => e.target.files?.[0] && uploadSyllabus(course.id, e.target.files[0])}
                            className="hidden"
                          />
                        </label>
                      </div>
                    )}
                  </div>

                  {/* Course Stats */}
                  <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-100">
                    <div className="text-center p-3 bg-blue-50 rounded-xl">
                      <div className="text-2xl font-bold text-blue-600">0</div>
                      <div className="text-xs text-gray-600">Students</div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-xl">
                      <div className="text-2xl font-bold text-purple-600">0</div>
                      <div className="text-xs text-gray-600">Assignments</div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <button className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-semibold">
                    Manage Course
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}