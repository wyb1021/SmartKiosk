import axios from 'axios';
import { API_BASE_URL } from '@env';           // e.g. http://192.168.0.10:4000/api

const api = axios.create({ baseURL: API_BASE_URL });

export const fetchMenus = () => api.get('/menu').then(r => r.data);
export const fetchMenuById  = id   => api.get(`/menu/${id}`).then(r => r.data);
export const fetchMenuByName = async (name) => {
  const list = await fetchMenus();
  return list.find(m => m.name.toLowerCase() === name.toLowerCase());
};
