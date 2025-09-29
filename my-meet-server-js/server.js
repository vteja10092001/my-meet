const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const socketHandler = require('./socket/socketHandler');

const server = http.createServer(app);

const PORT = 4000

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

socketHandler(io);

server.listen(PORT, () => {
  console.log(`✅ Server running on port : ${PORT}`);
});
