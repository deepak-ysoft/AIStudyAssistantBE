import { Server } from 'socket.io';

export const setupSocketIO = (server, corsOrigin) => {
  const io = new Server(server, {
    cors: {
      origin: corsOrigin,
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  const userSockets = new Map();

  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    socket.on('register-user', (userId) => {
      userSockets.set(userId, socket.id);
      console.log(`User ${userId} registered with socket ${socket.id}`);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
      for (const [userId, socketId] of userSockets.entries()) {
        if (socketId === socket.id) {
          userSockets.delete(userId);
          break;
        }
      }
    });
  });

  return {
    io,
    userSockets,
    sendNotification: (userId, notification) => {
      const socketId = userSockets.get(userId);
      if (socketId) {
        io.to(socketId).emit('notification', notification);
      }
    },
    broadcastNotification: (notification) => {
      io.emit('notification', notification);
    },
  };
};

export default setupSocketIO;
