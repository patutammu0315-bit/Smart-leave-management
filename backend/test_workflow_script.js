const http = require('http');

async function request(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
      }
    };
    if (token) options.headers['Authorization'] = `Bearer ${token}`;

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          if (res.headers['content-type']?.includes('application/pdf')) {
            resolve({ status: res.statusCode, data: 'PDF Data' });
          } else {
            resolve({ status: res.statusCode, data: JSON.parse(data) });
          }
        } catch (e) {
          resolve({ status: res.statusCode, data });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function run() {
  console.log('--- API End-to-End Test ---');

  // 1. Student Login
  let res = await request('POST', '/api/auth/login', { email: 'student.cse.a@example.com', password: 'student123', role: 'Student' });
  const studentToken = res.data.token;
  console.log('Student Login:', res.status);

  // 2. Student Apply Leave
  res = await request('POST', '/api/student/apply', { leave_type: 'Sick', from_date: '2024-05-01', to_date: '2024-05-02', reason: 'Fever' }, studentToken);
  const leaveId = res.data.id;
  console.log('Student Apply Leave:', res.status, leaveId);

  // 3. Mentor Login
  res = await request('POST', '/api/auth/login', { email: 'mentor.cse.a@example.com', password: 'mentor123', role: 'Mentor' });
  const mentorToken = res.data.token;
  console.log('Mentor Login:', res.status);

  // 4. Mentor Fetch Leaves
  res = await request('GET', '/api/mentor/leaves', null, mentorToken);
  console.log('Mentor Leaves:', res.status, res.data.length);

  // 5. Mentor Approve Leave
  res = await request('POST', `/api/mentor/leave/${leaveId}/approve`, { remarks: 'Approved.' }, mentorToken);
  console.log('Mentor Approve Leave:', res.status);

  // 6. Student Dashboard
  res = await request('GET', '/api/student/dashboard', null, studentToken);
  console.log('Student Dashboard:', res.status, res.data);

  // 7. Student Download PDF
  res = await request('GET', `/api/student/leave/${leaveId}/download-letter`, null, studentToken);
  console.log('Student Download PDF:', res.status, res.data);

  // 8. Admin Login
  res = await request('POST', '/api/auth/login', { email: 'rajeshstudyemail0315@gmail.com', password: 'rajesh@0315', role: 'Admin' });
  const adminToken = res.data.token;
  console.log('Admin Login:', res.status);

  // 9. Admin Dashboard
  res = await request('GET', '/api/admin/dashboard', null, adminToken);
  console.log('Admin Dashboard:', res.status, res.data);
}

run();
