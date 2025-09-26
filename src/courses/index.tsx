import useSWR from 'swr';
import { useEffect } from 'react';
import Router from 'next/router';
import API, { setAuthToken } from '../../lib/api';


const fetcher = (url: string) => API.get(url).then(r => r.data);


export default function Courses() {
useEffect(() => {
const t = localStorage.getItem('token');
if (!t) Router.push('/');
setAuthToken(t || undefined);
}, []);


const { data, error } = useSWR('/api/courses', fetcher);
if (error) return <div>Error loading</div>;
if (!data) return <div>Loading...</div>;


return (
<div style={{ padding: 24 }}>
<h1>Courses</h1>
<button onClick={() => Router.push('/courses/new')}>Create Course</button>
<ul>
{data.map((c: any) => (
<li key={c.id}>
<a href={`/courses/${c.id}`}>{c.title} — {c.lifecycle}</a>
</li>
))}
</ul>
</div>
);
}