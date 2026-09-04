const axios = require('axios');
(async () => {
  try {
    const api = axios.create({
      baseURL: 'http://localhost:5000/api',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    console.log("Sending request...");
    const response = await api.post('/auth/login', { phone: "+919998887776", password: "password123" });
    console.log("Response:", response.data);
  } catch (err) {
    console.error("Error:", err.message);
  }
})();
