import { Server } from 'socket.io';
import http from 'http';
import { PrismaClient } from '@prisma/client';
import { HttpMethods } from '../http/http.services';

export const wsModule = (server: http.Server, prisma: PrismaClient) => {
  const servicesMethods = new HttpMethods(prisma);

  const io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  const userConnections = new Map();
  let socketUserId = '';

  io.on('connection', (socket) => {
    // console.log(`Novo cliente conectado com socket.id: ${socket.id}`);

    socket.on('registerConnection', ({ userId }) => {
      socketUserId = userId;

      if (userConnections.has(userId)) {
        userConnections.get(userId).push(socket.id);
      } else {
        userConnections.set(userId, [socket.id]);
      }

      console.log(`Usuário ${userId} registrado com socket.id: ${socket.id}`);
    });

    // console.log(`Novo cliente conectado: ${socket.id}`);

    socket.on('message', async ({ chatId, content }) => {
      const userId = socketUserId;

      // const message = servicesModule;
      // io.to(`chat_${chatId}`).emit('newMessage', content);
      console.log(`Mensagem recebida de ${userId}: ${content}`);
      // io.emit('message', { userId: socket.id, content });
    });

    socket.on('disconnect', () => {
      console.log(`Cliente desconectado: ${socket.id}`);
      userConnections.delete(socket.id);
    });
  });

  return io;
};
