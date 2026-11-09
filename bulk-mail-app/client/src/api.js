import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
});

export const sendEmails = (data) => api.post('/emails/send', data);
export const getEmails = () => api.get('/emails');
export const deleteEmail = (id) => api.delete(`/emails/${id}`);