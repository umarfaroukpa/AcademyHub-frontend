'use client';

import { useState, useEffect } from 'react';
import api from '../../../lib/api';
import { Plus, Edit, Trash2, FileText, Calendar, Users } from 'lucide-react';
import { AxiosError } from 'axios';

interface Assignment {
  id: number;
  title: string;
  description: string;
  due_date: string;
  course_id: number;
  course_name: string;
  weight?: number;
  max_score?: number;
  created_at: string;
}

interface Course {
  id: number;
  title: string;
  code: string;
}

export default function AssignmentManagement() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssignments();
    fetchCourses();
  }, []);

  const fetchAssignments = async () => {
    try {
      const response = await api.get<Assignment[]>('/assignments');
      setAssignments(response.data);
    } catch (error) {
      console.error('Error fetching assignments:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await api.get<Course[]>('/courses');
      setCourses(response.data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const createAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formData = new FormData(e.target as HTMLFormElement);
      const assignmentData = {
        course_id: parseInt(formData.get('course_id') as string),
        title: formData.get('title'),
        description: formData.get('description'),
        due_date: formData.get('due_date'),
        weight: parseFloat(formData.get('weight') as string) || 100,
        max_score: parseFloat(formData.get('max_score') as string) || 100
      };

      await api.post('/assignments', assignmentData);
      await fetchAssignments();
      setShowCreateForm(false);
      (e.target as HTMLFormElement).reset();
      alert('Assignment created successfully!');
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        alert(error.response?.data?.error || 'Failed to create assignment');
      } else {
        alert('Failed to create assignment');
      }
    }
  };

  const updateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAssignment) return;

    try {
      const formData = new FormData(e.target as HTMLFormElement);
      const assignmentData = {
        title: formData.get('title'),
        description: formData.get('description'),
        due_date: formData.get('due_date'),
        weight: parseFloat(formData.get('weight') as string),
        max_score: parseFloat(formData.get('max_score') as string)
      };

      await api.put(`/assignments/${editingAssignment.id}`, assignmentData);
      await fetchAssignments();
      setEditingAssignment(null);
      alert('Assignment updated successfully!');
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        alert(error.response?.data?.error || 'Failed to update assignment');
      } else {
        alert('Failed to update assignment');
      }
    }
  };

  const deleteAssignment = async (assignmentId: number) => {
    if (!confirm('Are you sure you want to delete this assignment?')) return;

    try {
      await api.delete(`/assignments/${assignmentId}`);
      await fetchAssignments();
      alert('Assignment deleted successfully!');
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        alert(error.response?.data?.error || 'Failed to delete assignment');
      } else {
        alert('Failed to delete assignment');
      }
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Assignment Management</h1>
            <p className="text-gray-600">Create and manage course assignments</p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold"
          >
            <Plus className="w-5 h-5" />
            Create Assignment
          </button>
        </div>
      </div>

      {/* Create/Edit Form */}
      {(showCreateForm || editingAssignment) && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {editingAssignment ? 'Edit Assignment' : 'Create New Assignment'}
          </h2>
          <form onSubmit={editingAssignment ? updateAssignment : createAssignment} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Course</label>
                <select
                  name="course_id"
                  defaultValue={editingAssignment?.course_id}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
                  required
                >
                  <option value="">Select a course</option>
                  {courses.map(course => (
                    <option key={course.id} value={course.id}>
                      {course.code} - {course.title}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
                <input
                  type="datetime-local"
                  name="due_date"
                  defaultValue={editingAssignment?.due_date?.split('.')[0]}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
              <input
                type="text"
                name="title"
                defaultValue={editingAssignment?.title}
                placeholder="Enter assignment title"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                name="description"
                defaultValue={editingAssignment?.description}
                placeholder="Enter assignment description and requirements..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 resize-none"
                required
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Weight (%)</label>
                <input
                  type="number"
                  name="weight"
                  defaultValue={editingAssignment?.weight || 100}
                  min="0"
                  max="100"
                  step="0.1"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Max Score</label>
                <input
                  type="number"
                  name="max_score"
                  defaultValue={editingAssignment?.max_score || 100}
                  min="0"
                  step="0.1"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold"
              >
                {editingAssignment ? 'Update Assignment' : 'Create Assignment'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false);
                  setEditingAssignment(null);
                }}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-semibold"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Assignments List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Assignments</h2>
        
        {assignments.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600">No assignments created yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {assignments.map(assignment => (
              <div key={assignment.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <FileText className="w-6 h-6 text-blue-600" />
                      <h3 className="text-xl font-semibold text-gray-900">{assignment.title}</h3>
                    </div>
                    <p className="text-gray-600 mb-3">{assignment.description}</p>
                    
                    <div className="flex items-center gap-6 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        <span>{assignment.course_name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>Due: {new Date(assignment.due_date).toLocaleString()}</span>
                      </div>
                      {assignment.weight && (
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Weight:</span>
                          <span>{assignment.weight}%</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => setEditingAssignment(assignment)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => deleteAssignment(assignment.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}