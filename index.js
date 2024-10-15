const http = require('http');
const { Command } = require('commander');

// Налаштування параметрів командного рядка
const program = new Command();
program
  .requiredOption('-h, --host <host>', 'Server host')
  .requiredOption('-p, --port <port>', 'Server port')
  .requiredOption('-c, --cache <path>', 'Cache directory path');

program.parse(process.argv);
const { host, port, cache } = program.opts();

// Виведення значень параметрів
console.log(`Host: ${host}`);
console.log(`Port: ${port}`);
console.log(`Cache directory: ${cache}`);

// Запуск веб-сервера
const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Done\n');
});

// Запуск сервера з вказаними параметрами хост і порт
server.listen(port, host, () => {
  console.log(`Server running at http://${host}:${port}/`);
});
