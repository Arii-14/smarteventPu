async function test() {
  try {
    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'tendouariisu@gmail.com', password: 'Ari14042006' })
    });
    const loginData = await loginRes.json();
    const token = loginData.token;
    console.log('Logged in, token received');

    const formData = new FormData();
    formData.append('title', 'Test Event from Node');
    formData.append('location', 'Test Location');
    formData.append('start_date', '2026-07-11T12:00');
    formData.append('visibility', 'public');
    formData.append('status', 'draft');
    
    // To see what error is thrown
    const res = await fetch('http://localhost:5000/api/events', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: formData
    });
    const text = await res.text();
    console.log('Status:', res.status, res.statusText);
    console.log('Response:', text);
  } catch (err) {
    console.error('Error:', err);
  }
}
test();
