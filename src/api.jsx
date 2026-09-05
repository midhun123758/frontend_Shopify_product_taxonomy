import axios from 'axios';

// Create a central Axios instance
const apiClient = axios.create({
  baseURL: 'http://localhost/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const api = {
  uploadProducts: async (formData) => {
    const response = await apiClient.post('/products/import/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  getStats: async () => {
    const response = await apiClient.get('/products/stats/');
    return response.data;
  },

  getReviewProducts: async (page = 1) => {
    const response = await apiClient.get(`/products/review/?page=${page}`);
    return response.data;
  },

  getAllProducts: async (search = '', mainCategory = '', status = '', page = 1) => {
    let url = `/products/?page=${page}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    if (mainCategory) url += `&main_category=${encodeURIComponent(mainCategory)}`;
    if (status) url += `&status=${encodeURIComponent(status)}`;
    const response = await apiClient.get(url);
    return response.data; 
  },
  
  getFamilies: async (search = '', status = '', page = 1) => {
    let url = `/families/?page=${page}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    if (status) url += `&status=${encodeURIComponent(status)}`;
    const response = await apiClient.get(url);
    return response.data;
  },
  
  analyzeFamily: async (familyId) => {
    const response = await apiClient.post(`/families/${familyId}/analyze/`);
    return response.data;
  },

  getMainCategories: async () => {
    const response = await apiClient.get('/categories/main/');
    return response.data;
  },

  updateProductCategory: async (productId, categoryName) => {
    const response = await apiClient.patch(`/products/${productId}/`, {
      category_name: categoryName,
    });
    return response.data;
  },

  pauseProcessing: async () => {
    const response = await apiClient.post('/products/pause/');
    return response.data;
  },

  resumeProcessing: async () => {
    const response = await apiClient.post('/products/resume/');
    return response.data;
  },

  getFamilyDetail: async (familyId) => {
    const response = await apiClient.get(`/families/${familyId}/`);
    return response.data;
  },

  getProductDetail: async (productId) => {
    const response = await apiClient.get(`/products/${productId}/detail/`);
    return response.data;
  }
};

export default api;
