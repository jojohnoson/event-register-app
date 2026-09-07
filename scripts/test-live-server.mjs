async function testLiveServer() {
  const payload = {
    event_id: 1,
    name: "Jo Test",
    email: "jo.test.live." + Date.now() + "@gmail.com",
    phone: "+916379013930",
    age: "21",
    organization: "Internshala",
    role: "Data Engineer",
    notes: "Live server test",
  };

  console.log('Sending POST to http://localhost:3000/api/registrations/create ...');
  try {
    const res = await fetch('http://localhost:3000/api/registrations/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    console.log('Response status:', res.status);
    console.log('Response body:', JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Fetch error:', err);
  }
}

testLiveServer().catch(console.error);
