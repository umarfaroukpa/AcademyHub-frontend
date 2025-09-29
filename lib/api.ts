import axios from 'axios';


const API = axios.create({ 
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api' });

//auth token request interceptor
export function setAuthToken(token?: string) {
if (token) API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
else delete API.defaults.headers.common['Authorization'];
}


export default API;