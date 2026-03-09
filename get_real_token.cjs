const axios = require('axios');
async function go() {
  try {
    const res = await axios.post('https://bkbs-backend.vercel.app/api/auth/login', {
       email: 'admin@example.com',
       password: 'password123'
    });
    console.log(res.data);
  } catch (err) { console.log(err.response?.status, err.response?.data); }
}
go();
