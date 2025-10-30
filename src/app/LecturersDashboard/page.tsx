'use client';

import { useState, useEffect } from 'react';
import api from '../../../lib/api';
import axios from 'axios';
import AssignmentManagement from '../AssignmentManagement/page';
import SubmissionGrading from '../SubmissionGrading/page';
import { BookOpen, Plus, Upload, Sparkles, FileText, Download, LayoutDashboard, Users, CheckCircle } from 'lucide-react';

interface Course {
  id: number;
  code: string;
  title: string;
  description: string;
  lecturer_id?: number;
  syllabus_url?: string;
  semester_id?: number;
  department_id?: number;
  credits?: number;
  is_active?: boolean;
  max_students?: number;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

interface GeneratedSyllabus {
  title: string;
  description: string;
  learning_outcomes: string[];
  weeks: Array<{
    week: number;
    topics: string[];
    assignments?: string[];
  }>;
  assessment: Array<{
    type: string;
    weight: number;
    description: string;
  }>;
}

type LecturerTab = 'dashboard' | 'courses' | 'assignments' | 'grading';

export default function LecturerDashboard() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [syllabusTopic, setSyllabusTopic] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [generatedSyllabus, setGeneratedSyllabus] = useState<GeneratedSyllabus | null>(null);
  const [isGeneratingSyllabus, setIsGeneratingSyllabus] = useState(false);
  const [activeTab, setActiveTab] = useState<LecturerTab>('dashboard');

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await api.get('/courses');
      setCourses(response.data as Course[]);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const createCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formData = new FormData(e.target as HTMLFormElement);
      const courseData = {
        code: formData.get('code'),
        title: formData.get('title'),
        description: formData.get('description'),
        credits: parseInt(formData.get('credits') as string) || 3,
        max_students: parseInt(formData.get('max_students') as string) || 50
      };
      
      console.log('📤 Sending course data:', courseData);
      
      const response = await api.post('/courses', courseData);
      console.log('✅ Course created successfully:', response.data);
      
      await fetchCourses();
      setShowCreateForm(false);
      (e.target as HTMLFormElement).reset();
      alert('Course created successfully!');
    } catch (error: unknown) {
      console.error('❌ Error creating course:', error);
      
      let errorMessage = 'Unknown error occurred';
      
      if (axios.isAxiosError(error)) {
        console.error('Error response:', error.response?.data);
        errorMessage = error.response?.data?.error ||
                      error.response?.data?.message ||
                      error.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      alert(`Failed to create course: ${errorMessage}`);
    }
  }

  const uploadSyllabus = async (courseId: number, file: File) => {
    try {
      const formData = new FormData();
      formData.append('syllabus', file);
      await api.post(`/courses/${courseId}/syllabus`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      fetchCourses();
      alert('Syllabus uploaded successfully!');
    } catch (error) {
      console.error('Error uploading syllabus:', error);
      alert('Failed to upload syllabus. Please try again.');
    }
  };

  const generateSyllabus = async () => {
    if (!syllabusTopic.trim()) {
      alert('Please enter a course topic');
      return;
    }
    
    try {
      setIsGeneratingSyllabus(true);
      const response = await api.post<GeneratedSyllabus>('/ai/syllabus', { topic: syllabusTopic });
      console.log('Generated syllabus:', response.data);
      setGeneratedSyllabus(response.data);
      
      if (!showCreateForm) {
        setShowCreateForm(true);
      }
    } catch (error) {
      console.error('Error generating syllabus:', error);
      alert('Failed to generate syllabus. Please try again.');
    } finally {
      setIsGeneratingSyllabus(false);
    }
  };

  const handleUseGeneratedSyllabus = (courseId: number) => {
    if (!generatedSyllabus) return;
    console.log('Using generated syllabus for course:', courseId, generatedSyllabus);
    alert(`Generated syllabus content for "${generatedSyllabus.title}" is ready to be used for this course! Check console for details.`);
  };

  const downloadSyllabus = () => {
    if (!generatedSyllabus) return;
    
    const syllabusContent = `
SYLLABUS: ${generatedSyllabus.title}

${generatedSyllabus.description}

LEARNING OUTCOMES:
${generatedSyllabus.learning_outcomes.map(obj => `• ${obj}`).join('\n')}

WEEKLY SCHEDULE:
${generatedSyllabus.weeks.map(week => `
Week ${week.week}:
Topics: ${week.topics.join(', ')}
${week.assignments ? `Assignments: ${week.assignments.join(', ')}` : ''}
`).join('\n')}

ASSESSMENT:
${generatedSyllabus.assessment.map(assess => `
${assess.type} (${assess.weight}%): ${assess.description}
`).join('\n')}
    `.trim();

    const blob = new Blob([syllabusContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `syllabus-${generatedSyllabus.title.toLowerCase().replace(/\s+/g, '-')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const autoFillCourseForm = () => {
    if (!generatedSyllabus) return;
    
    const titleInput = document.querySelector('input[name="title"]') as HTMLInputElement;
    const descriptionInput = document.querySelector('textarea[name="description"]') as HTMLTextAreaElement;
    
    if (titleInput) {
      titleInput.value = generatedSyllabus.title.replace('Syllabus for ', '');
    }
    
    if (descriptionInput) {
      descriptionInput.value = generatedSyllabus.description;
    }
    
    setShowCreateForm(true);
  };

  // Tab Navigation Component
  const TabNavigation = () => (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
      <div className="flex space-x-1">
        {[
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'courses', label: 'My Courses', icon: BookOpen },
          { id: 'assignments', label: 'Assignments', icon: FileText },
          { id: 'grading', label: 'Grade Submissions', icon: CheckCircle }
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id as LecturerTab)}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl font-semibold transition-colors ${
              activeTab === id
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>
    </div>
  );

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

      {/* Tab Navigation */}
      <TabNavigation />

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <>
          {/* AI Syllabus Generator */}
          <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl shadow-sm border border-purple-200 p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">AI Syllabus Generator</h2>
                <p className="text-gray-600 mb-4">Let AI help you create a comprehensive course syllabus</p>
                
                <div className="flex gap-3 mb-4">
                  <input
                    type="text"
                    placeholder="Enter course topic (e.g., Data Structures and Algorithms)..."
                    value={syllabusTopic}
                    onChange={(e) => setSyllabusTopic(e.target.value)}
                    className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 transition-colors bg-white"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        generateSyllabus();
                      }
                    }}
                  />
                  <button
                    onClick={generateSyllabus}
                    disabled={isGeneratingSyllabus}
                    className="px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors font-semibold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Sparkles className="w-5 h-5" />
                    {isGeneratingSyllabus ? 'Generating...' : 'Generate'}
                  </button>
                </div>

                {/* Display Generated Syllabus */}
                {generatedSyllabus && (
                  <div className="bg-white rounded-xl border border-purple-200 p-4 mt-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-900">{generatedSyllabus.title}</h3>
                      <div className="flex gap-2">
                        <button
                          onClick={downloadSyllabus}
                          className="flex items-center gap-2 px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <Download className="w-4 h-4" />
                          Download
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-4 max-h-80 overflow-y-auto p-2">
                      <div>
                        <h4 className="font-medium text-gray-700 mb-2">Overview:</h4>
                        <p className="text-sm text-gray-600">{generatedSyllabus.description}</p>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-gray-700 mb-2">Learning Outcomes:</h4>
                        <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
                          {generatedSyllabus.learning_outcomes?.map((obj, index) => (
                            <li key={`learning-outcome-${index}`}>{obj}</li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-gray-700 mb-2">Weekly Schedule (Sample):</h4>
                        <div className="text-sm text-gray-600 space-y-2">
                          {generatedSyllabus.weeks?.slice(0, 3).map((week) => (
                            <div key={`week-${week.week}`} className="bg-gray-50 p-3 rounded-lg">
                              <strong className="text-blue-600">Week {week.week}:</strong>
                              <div className="mt-1">
                                <span className="font-medium">Topics:</span> {week.topics?.join(', ')}
                              </div>
                              {week.assignments && week.assignments.length > 0 && (
                                <div>
                                  <span className="font-medium">Assignments:</span> {week.assignments.join(', ')}
                                </div>
                              )}
                            </div>
                          ))}
                          {generatedSyllabus.weeks && generatedSyllabus.weeks.length > 3 && (
                            <p className="text-purple-600 text-center">
                              ... and {generatedSyllabus.weeks.length - 3} more weeks
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-gray-700 mb-2">Assessment Breakdown:</h4>
                        <div className="text-sm text-gray-600 space-y-2">
                          {generatedSyllabus.assessment?.map((item, index) => (
                            <div key={`assessment-${index}`} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                              <div>
                                <strong>{item.type}</strong>: {item.description}
                              </div>
                              <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs font-semibold">
                                {item.weight}%
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-sm text-gray-600 mb-2">
                        This syllabus can be used when creating a new course or added to an existing course.
                      </p>
                      <div className="flex gap-2 flex-wrap">
                        <button
                          onClick={() => setShowCreateForm(true)}
                          className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Create New Course
                        </button>
                        <button
                          onClick={autoFillCourseForm}
                          className="px-4 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                        >
                          Auto-fill Course Form
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center">
                  <BookOpen className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <div className="text-3xl font-bold text-gray-900">{courses.length}</div>
                  <div className="text-sm text-gray-600">Total Courses</div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center">
                  <Users className="w-8 h-8 text-green-600" />
                </div>
                <div>
                  <div className="text-3xl font-bold text-gray-900">0</div>
                  <div className="text-sm text-gray-600">Total Students</div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center">
                  <FileText className="w-8 h-8 text-purple-600" />
                </div>
                <div>
                  <div className="text-3xl font-bold text-gray-900">0</div>
                  <div className="text-sm text-gray-600">Pending Submissions</div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Courses Tab */}
      {activeTab === 'courses' && (
        <>
          {/* Create Course Form */}
          {showCreateForm && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Create New Course</h2>
              <form onSubmit={createCourse} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Course Code <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="code"
                      placeholder="e.g., CS101"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors"
                      required
                      maxLength={20}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Credits <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="credits"
                      type="number"
                      placeholder="e.g., 3"
                      min="1"
                      max="10"
                      defaultValue="3"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Course Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="title"
                    placeholder="e.g., Introduction to Computer Science"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="description"
                    placeholder="Provide a brief description of the course..."
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors resize-none"
                    required
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max Students
                    </label>
                    <input
                      name="max_students"
                      type="number"
                      placeholder="e.g., 50"
                      min="1"
                      defaultValue="50"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Semester ID
                    </label>
                    <input
                      name="semester_id"
                      type="number"
                      placeholder="e.g., 1"
                      min="1"
                      defaultValue="1"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors"
                    />
                    <p className="text-xs text-gray-500 mt-1">Leave as 1 if unsure</p>
                  </div>
                </div>

                {generatedSyllabus && (
                  <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-purple-700 text-sm">
                        <strong>Tip:</strong> You have a generated syllabus for &quot;{generatedSyllabus.title.replace('Syllabus for ', '')}&quot;
                      </p>
                      <button
                        type="button"
                        onClick={autoFillCourseForm}
                        className="px-3 py-1 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        Auto-fill with Syllabus
                      </button>
                    </div>
                  </div>
                )}

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
                  <div key={`course-${course.id}`} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all">
                    <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm rounded-lg text-white text-sm font-semibold mb-2">
                            {course.code}
                          </div>
                          <h3 className="text-xl font-bold text-white">{course.title}</h3>
                        </div>
                      </div>
                      <p className="text-blue-100 text-sm line-clamp-2">{course.description}</p>
                    </div>

                    <div className="p-6 space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-gray-600" />
                            Course Syllabus
                          </h4>
                          {generatedSyllabus && (
                            <button
                              onClick={() => handleUseGeneratedSyllabus(course.id)}
                              className="text-sm bg-purple-600 text-white px-3 py-1 rounded-lg hover:bg-purple-700 transition-colors"
                            >
                              Use Generated Syllabus
                            </button>
                          )}
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

                      <button className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-semibold">
                        Manage Course
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Assignments Tab */}
      {activeTab === 'assignments' && (
        <AssignmentManagement />
      )}

      {/* Grading Tab */}
      {activeTab === 'grading' && (
        <SubmissionGrading />
      )}
    </div>
  );
}