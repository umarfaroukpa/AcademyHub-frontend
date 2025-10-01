import { useState, useEffect } from 'react';
import { Course, Assignment, Submission } from '../../types/types';
import api from '../../lib/api';

interface AssignmentResponse {
  id: number;
  title: string;
  description: string;
}

export default function LecturerDashboard() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [assignments, setAssignments] = useState<AssignmentResponse[]>([]);
  const [syllabusTopic, setSyllabusTopic] = useState('');

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
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Lecturer Dashboard</h1>

      {/* Create Course */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Create New Course</h2>
        <form onSubmit={createCourse} className="space-y-2">
          <input name="title" placeholder="Course Title" className="w-full p-2 border rounded" required />
          <textarea name="description" placeholder="Description" className="w-full p-2 border rounded" required />
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
            Create Course
          </button>
        </form>
      </div>

      {/* AI Syllabus Generator */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">AI Syllabus Generator</h2>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Enter course topic..."
            value={syllabusTopic}
            onChange={(e) => setSyllabusTopic(e.target.value)}
            className="flex-1 p-2 border rounded"
          />
          <button onClick={generateSyllabus} className="bg-green-500 text-white px-4 py-2 rounded">
            Generate Syllabus
          </button>
        </div>
      </div>

      {/* My Courses */}
      <div>
        <h2 className="text-xl font-semibold mb-4">My Courses</h2>
        <div className="space-y-4">
          {courses.map(course => (
            <div key={course.id} className="border p-4 rounded">
              <h3 className="font-semibold">{course.title}</h3>
              <p className="text-gray-600">{course.description}</p>
              <div className="mt-2">
                <input
                  type="file"
                  accept=".pdf,.docx"
                  onChange={(e) => e.target.files?.[0] && uploadSyllabus(course.id, e.target.files[0])}
                  className="mb-2"
                />
                {course.syllabus_url && (
                  <a href={`http://localhost:5000/uploads/${course.syllabus_url}`} className="text-blue-500">
                    View Syllabus
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}