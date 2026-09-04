const axios = require('axios');
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});
const url = api.getUri({ url: '/auth/login' });
console.log("Resolved URL:", url);
