'use client';

import useSWR from 'swr';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import API, { setAuthToken } from '../../lib/api';

// Define the Course type
interface Course {
  id: number;
  title: string;
  lifecycle: string;
  description?: string;
  lecturer_name?: string;
}

// Properly typed fetcher function
const fetcher = async (url: string): Promise<Course[]> => {
  const response = await API.get<Course[]>(url);
  return response.data;
};

export default function CoursesPage() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/');
      return;
    }
    setAuthToken(token);
  }, [router]);

  const { data: courses, error, isLoading } = useSWR<Course[]>('/api/courses', fetcher);

  if (error) {
    return (
      <div className="p-6">
        <div className="text-red-600">Error loading courses</div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div>Loading courses...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Courses</h1>
        <button
          onClick={() => router.push('/courses/new')}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Create Course
        </button>
      </div>
      
      <div className="grid gap-4">
        {courses?.map((course) => (
          <div
            key={course.id}
            className="border p-4 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => router.push(`/courses/${course.id}`)}
          >
            <h2 className="text-lg font-semibold">{course.title}</h2>
            <p className="text-gray-600">Status: {course.lifecycle}</p>
            {course.lecturer_name && (
              <p className="text-sm text-gray-500">Lecturer: {course.lecturer_name}</p>
            )}
          </div>
        ))}
        
        {courses?.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No courses available. Create your first course!
          </div>
        )}
      </div>
    </div>
  );
}