export interface User {
  id: number;
  email: string;
  name: string;
  role: 'student' | 'lecturer' | 'admin';
}

export interface Course {
  id: number;
  title: string;
  description: string;
  lecturer_id: number;
  lecturer_name?: string;
  syllabus_url?: string;
  status: string;
  enrolled?: boolean;
}

export interface Enrollment {
  id: number;
  student_id: number;
  course_id: number;
  status: 'pending' | 'approved' | 'rejected';
  student_name?: string;
  course_name?: string;
}

export interface Assignment {
  id: number;
  course_id: number;
  title: string;
  description: string;
  weight: number;
  due_date: string;
}

export interface Submission {
  id: number;
  assignment_id: number;
  student_id: number;
  content: string;
  file_url: string;
  grade?: number;
}