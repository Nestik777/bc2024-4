const http = require('http');
const fs = require('fs').promises;
const path = require('path');
const superagent = require('superagent');
const { Command } = require('commander');
const program = new Command();
program
.requiredOption('-h, --host <host>', 'Server host')
.requiredOption('-p, --port <port>', 'Server port')
.requiredOption('-c, --cache <path>', 'Cache directory path');
program.parse(process.argv);
const { host, port, cache } = program.opts();
console.log(`Host: ${host}`);
console.log(`Port: ${port}`);
console.log(`Cache directory: ${cache}`);
const server = http.createServer(async (req, res) => {
const urlParts = req.url.split('/');
const httpCode = urlParts[1];
const filePath = path.join(cache, `${httpCode}.jpg`);
if (req.method === 'GET') {
try {
const image = await fs.readFile(filePath);
res.writeHead(200, { 'Content-Type': 'image/jpeg' });
res.end(image);
} catch (error) {
if (error.code === 'ENOENT') {
try {
const response = await superagent.get(`https://http.cat/${httpCode}`);
const imageBuffer = response.body;
await fs.writeFile(filePath, imageBuffer);
res.writeHead(200, { 'Content-Type': 'image/jpeg' });
res.end(imageBuffer);
} catch (fetchError) {
res.writeHead(404, { 'Content-Type': 'text/plain' });
res.end('Not Found');
}
} else {
res.writeHead(500, { 'Content-Type': 'text/plain' });
res.end('Internal Server Error');
}
}
} else if (req.method === 'PUT') {
try {
const data = [];
req.on('data', chunk => data.push(chunk));
req.on('end', async () => {
const imageBuffer = Buffer.concat(data);
await fs.writeFile(filePath, imageBuffer);
res.writeHead(201, { 'Content-Type': 'text/plain' });
res.end('Created');
});
} catch (error) {
res.writeHead(500, { 'Content-Type': 'text/plain' });
res.end('Internal Server Error');
}
} else if (req.method === 'DELETE') {
try {
await fs.unlink(filePath);
res.writeHead(200, { 'Content-Type': 'text/plain' });
res.end('Deleted');
} catch (error) {
if (error.code === 'ENOENT') {
res.writeHead(404, { 'Content-Type': 'text/plain' });
res.end('Not Found');
} else {
res.writeHead(500, { 'Content-Type': 'text/plain' });
res.end('Internal Server Error');
}
}
} else {
res.writeHead(405, { 'Content-Type': 'text/plain' });
res.end('Method Not Allowed');
}
});
server.listen(port, host, () => {
console.log(`http://${host}:${port}/`);
});