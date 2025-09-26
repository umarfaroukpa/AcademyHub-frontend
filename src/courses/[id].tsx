import { useState, useEffect } from 'react';
import Router, { useRouter } from 'next/router';
import API, { setAuthToken } from '../../lib/api';


export default function CourseEditor() {
const router = useRouter();
const { id } = router.query;
const [course, setCourse] = useState<any>(null);
const [title, setTitle] = useState('');
const [code, setCode] = useState('');
const [description, setDescription] = useState('');

useEffect(() => {
const t = localStorage.getItem('token');
setAuthToken(t || undefined);
if (id && id !== 'new') fetchCourse();
}, [id]);


async function fetchCourse() {
const res = await API.get(`/api/courses/${id}`);
setCourse(res.data);
setTitle(res.data.title);
setCode(res.data.code);
setDescription(res.data.description);
}


async function save() {
if (id === 'new') {
await API.post('/api/courses', { code, title, description });
} else {
await API.put(`/api/courses/${id}`, { code, title, description });
}
Router.push('/courses');
}


async function transition(action: string) {
await API.post(`/api/courses/${id}/transition`, { action });
fetchCourse();
}


if (id === 'new') {
return (
<div style={{ padding: 24 }}>
<h1>Create Course</h1>
<div><input placeholder="code" value={code} onChange={e => setCode(e.target.value)} /></div>
<div><input placeholder="title" value={title} onChange={e => setTitle(e.target.value)} /></div>
<div><textarea placeholder="description" value={description} onChange={e => setDescription(e.target.value)} /></div>
<button onClick={save}>Save</button>
</div>
);
}


if (!course) return <div>Loading...</div>;


return (
<div style={{ padding: 24 }}>
<h1>Edit Course</h1>
<div>Lifecycle: {course.lifecycle}</div>
<div><input value={code} onChange={e => setCode(e.target.value)} /></div>
<div><input value={title} onChange={e => setTitle(e.target.value)} /></div>
<div><textarea value={description} onChange={e => setDescription(e.target.value)} /></div>
<button onClick={save}>Save</button>
<div style={{ marginTop: 12 }}>
<button onClick={() => transition('submitForReview')}>Submit For Review</button>
<button onClick={() => transition('publish')}>Publish</button>
<button onClick={() => transition('archive')}>Archive</button>
</div>
</div>
);
}