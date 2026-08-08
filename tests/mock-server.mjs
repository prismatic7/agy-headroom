import http from 'http';

const port = parseInt(process.argv[2], 10) || 0;
const server = http.createServer((req, res) => {
  if (req.url === '/stats') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok' }));
  } else {
    res.writeHead(404);
    res.end();
  }
});

server.listen(port, '127.0.0.1', () => {
  const address = server.address();
  console.log(`MOCK_SERVER_READY:${address.port}`);
});
