const { log } = require('../utils/logger');

const socketHandler = (io) => {
  io.on('connection', (socket) => {
    log(`Client connected: ${socket.id}`);

    socket.on('join-room', ({ roomId, username }) => {
      socket.join(roomId);
      socket.roomId = roomId;
      socket.username = username;

      socket.to(roomId).emit('user-joined', {
        userId: socket.id,
        username,
      });

      log(`${username} (${socket.id}) joined room ${roomId}`);
    });

    socket.on('offer', ({ to, offer }) => {
      io.to(to).emit('offer', {
        from: socket.id,
        offer,
        username: socket.username,
      });
    });

    socket.on('answer', ({ to, answer }) => {
      io.to(to).emit('answer', {
        from: socket.id,
        answer,
      });
    });

    socket.on('ice-candidate', ({ to, candidate }) => {
      io.to(to).emit('ice-candidate', {
        from: socket.id,
        candidate,
      });
    });

    socket.on('chat-message', ({ data }) => {
      const roomId = socket.roomId;
      if (roomId) {
        io.to(roomId).emit('chat-message', {
          data,
          sender: socket.id,
          username: socket.username,
        });
      }
    });

    socket.on('file-shared', ({ file }) => {
      const roomId = socket.roomId;
      if (roomId) {
        socket.to(roomId).emit('file-shared', {
          file,
          sender: socket.id,
          username: socket.username,
        });
      }
    });

    socket.on('disconnect', () => {
      const roomId = socket.roomId;
      if (roomId) {
        socket.to(roomId).emit('user-left', { userId: socket.id });
        log(`Client disconnected: ${socket.id} from room ${roomId}`);
      } else {
        log(`Client disconnected: ${socket.id}`);
      }
    });
  });
};

module.exports = socketHandler;
