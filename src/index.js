const http = require('http');

const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({ message: "Midterm Exam Server is running!" }));
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});
