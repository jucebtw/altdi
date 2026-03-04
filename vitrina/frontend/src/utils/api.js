import axios from 'axios';

// В production используем относительный путь (/api), в dev - из .env или localhost
const API_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.PROD ? '/api' : 'http://localhost:3000/api');

const api = axios.create({
  baseURL: API_URL,
});

// Функция для нормализации путей к изображениям
export const normalizeImagePath = (imagePath) => {
  if (!imagePath) return '';
  
  // Если путь уже относительный (начинается с /), возвращаем как есть
  if (imagePath.startsWith('/')) {
    return imagePath;
  }
  
  // Если содержит localhost:3000, заменяем на относительный путь
  if (imagePath.includes('localhost:3000')) {
    return imagePath.replace(/https?:\/\/localhost:3000/, '');
  }
  
  // Если содержит полный URL с доменом, оставляем как есть (для внешних изображений)
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // Если путь не начинается с /, добавляем /uploads/
  if (!imagePath.startsWith('/uploads/')) {
    return `/uploads/${imagePath}`;
  }
  
  return imagePath;
};

// Добавление токена к запросам
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Обработка ошибок
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Логируем ошибки для отладки
    if (error.response) {
      console.error('API Error:', error.response.status, error.response.data);
    } else if (error.request) {
      console.error('Network Error:', error.request);
    } else {
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default api;
