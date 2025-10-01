// import { useState } from 'react';
// import { useRouter } from 'next/router';
// import api from '../../lib/api';


// interface LoginResponse {
//   token: string;
//   user: {
//     id: string;
//     email: string;
//     name: string;
//     role: 'student' | 'lecturer' | 'admin';
//   };
// }

// export default function Login() {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const router = useRouter();

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     try {
//       const response = await api.post('/auth/login', { email, password });
//       const data = response.data as LoginResponse;
//       localStorage.setItem('token', data.token);
//       localStorage.setItem('user', JSON.stringify(data.user));
//       router.push('/dashboard');
//     } catch (error) {
//       alert('Login failed');
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-50">
//       <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-96">
//         <h2 className="text-2xl font-bold mb-6">Login</h2>
//         <input
//           type="email"
//           placeholder="Email"
//           value={email}
//           onChange={(e) => setEmail(e.target.value)}
//           className="w-full p-2 mb-4 border rounded"
//           required
//         />
//         <input
//           type="password"
//           placeholder="Password"
//           value={password}
//           onChange={(e) => setPassword(e.target.value)}
//           className="w-full p-2 mb-4 border rounded"
//           required
//         />
//         <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded">
//           Login
//         </button>
//       </form>
//     </div>
//   );
// }

// app/page.tsx - Login Page
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  // Mock users for testing
  const mockUsers = [
    { id: 1, name: 'John Doe', email: 'student@test.com', password: 'student123', role: 'student' },
    { id: 2, name: 'Dr. Sarah Johnson', email: 'lecturer@test.com', password: 'lecturer123', role: 'lecturer' },
    { id: 3, name: 'Admin Mike', email: 'admin@test.com', password: 'admin123', role: 'admin' }
  ];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Find user
    const user = mockUsers.find(u => u.email === email && u.password === password);

    if (!user) {
      setError('Invalid email or password');
      return;
    }

    // Store user data (excluding password)
    const { password: _, ...userWithoutPassword } = user;
    localStorage.setItem('user', JSON.stringify(userWithoutPassword));
    localStorage.setItem('token', 'mock-token-' + Date.now());

    // Redirect to dashboard
    router.push('/dashboard');
  };

  const quickLogin = (role: string) => {
    const user = mockUsers.find(u => u.role === role);
    if (user) {
      const { password: _, ...userWithoutPassword } = user;
      localStorage.setItem('user', JSON.stringify(userWithoutPassword));
      localStorage.setItem('token', 'mock-token-' + Date.now());
      router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 w-full max-w-md border border-white/20">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">AcademiHub</h1>
          <p className="text-blue-100">Academic Management Platform</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4 mb-6">
          <div>
            <label className="block text-white text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Enter your email"
              required
            />
          </div>

          <div>
            <label className="block text-white text-sm font-medium mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Enter your password"
              required
            />
          </div>

          {error && (
            <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full p-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
          >
            Login
          </button>
        </form>

        <div className="border-t border-white/20 pt-6">
          <p className="text-white text-sm text-center mb-3">Quick Login (Testing)</p>
          <div className="space-y-2">
            <button
              onClick={() => quickLogin('student')}
              className="w-full p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white text-sm transition-colors"
            >
              Login as Student
            </button>
            <button
              onClick={() => quickLogin('lecturer')}
              className="w-full p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white text-sm transition-colors"
            >
              Login as Lecturer
            </button>
            <button
              onClick={() => quickLogin('admin')}
              className="w-full p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white text-sm transition-colors"
            >
              Login as Admin
            </button>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-white/60 text-xs">
            Test credentials:
            <br />
            Student: student@test.com / student123
            <br />
            Lecturer: lecturer@test.com / lecturer123
            <br />
            Admin: admin@test.com / admin123
          </p>
        </div>
      </div>
    </div>
  );
}