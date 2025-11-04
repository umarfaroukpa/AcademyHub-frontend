'use client';

import React, { useState } from 'react';
import Router from 'next/router';
import API, { setAuthToken } from '../../lib/api';


export default function Login() {
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const [error, setError] = useState('');


async function submit(e: React.FormEvent) {
e.preventDefault();
try {
const res = await API.post('/api/auth/login', { email, password });
const { token } = (res.data as { token: string });
localStorage.setItem('token', token);
setAuthToken(token);
Router.push('/courses');
} catch (err: unknown) {
  if (typeof err === 'object' && err !== null && 'response' in err) {
	const errorMsg =
	  (err as { response?: { data?: { error?: string } } }).response?.data?.error || 'Login failed';
	setError(errorMsg);
  } else {
	setError('Login failed');
  }
}
}


return (
<div style={{ padding: 40 }}>
<h1>Login</h1>
<form onSubmit={submit}>
<div>
<input value={email} onChange={e => setEmail(e.target.value)} placeholder="email" />
</div>
<div>
<input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="password" />
</div>
<button type="submit">Login</button>
</form>
{error && <p style={{ color: 'red' }}>{error}</p>}
</div>
);
}