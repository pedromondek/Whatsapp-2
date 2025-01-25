import { Server } from 'socket.io';

export const wsModule = (server: any) => {
  const io = new Server(server);

  io.on('connection', (socket) => {
    console.log('Novo cliente conectado');

    io.on('message', (message) => {
      console.log(`Mensagem recebida: ${message}`);
    });

    io.on('disconnect', () => {
      console.log('Cliente desconectado');
    });
  });

  return io;
};
