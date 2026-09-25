import http from 'http';

const data = JSON.stringify({
  projectContext: {
    title: 'AI Crop Disease Detection Platform',
    problem: 'Smallholder farmers lose 30% yields to leaf infections.',
    solution: 'Edge AI computer vision smartphone diagnostic scanner.',
    category: 'Agriculture & Agritech'
  }
});

const req = http.request({
  hostname: 'localhost',
  port: 5175,
  path: '/api/ai-project-analyzer',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data),
  },
}, (res) => {
  let body = '';
  res.on('data', chunk => { body += chunk; });
  res.on('end', () => {
    console.log(`Port 5175 Status: ${res.statusCode}`);
    console.log(`Body: ${body.substring(0, 150)}...`);
  });
});

req.on('error', (err) => console.error(err));
req.write(data);
req.end();
