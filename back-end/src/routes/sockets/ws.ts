import { Server, Socket } from 'socket.io';
import http from 'http';
import { PrismaClient } from '@prisma/client';
import { HttpMethods } from '../http/http.services';

export class WebSocketService {
  private io: Server;
  private servicesMethods: HttpMethods;
  private userConnections: Map<string, string[]>;

  constructor(server: http.Server, prisma: PrismaClient) {
    this.servicesMethods = new HttpMethods(prisma);
    this.userConnections = new Map();

    this.io = new Server(server, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
      },
    });

    this.socketEvents();
  }

  private async socketEvents(): Promise<void> {
    this.io.on('connection', (socket: Socket) => {
      let socketUserId = '';

      socket.on('registerConnection', ({ userId }) => this.registerConnection(socket, userId));

      socket.on('message', async ({ userId, chatId, content }) => this.newMessage(socket, userId, chatId, content));

      socket.on('disconnect', () => this.registerDisconnect(socket, socketUserId));

      this.joinChats(socket);
    });
  }

  private async joinChats(socket: Socket): Promise<void> {
    socket.on('joinChats', ({ chatsId }) => {
      chatsId.forEach((chatId: number) => {
        socket.join(`chat_${chatId}`);
        console.log(`Usuário socket.id: ${socket.id}, entrou na sala: chat_${chatId}`);
      });
    });
  }

  private async registerConnection(socket: Socket, userId: string) {
    if (this.userConnections.has(userId)) {
      this.userConnections.get(userId)?.push(socket.id);
    } else {
      this.userConnections.set(userId, [socket.id]);
    }

    console.log(`Usuário ${userId} registrado com socket.id: ${socket.id}`);
  }

  private async newMessage(socket: Socket, userId: number, chatId: number, content: string) {
    const message = await this.servicesMethods.createMessage(userId, chatId, content);

    console.log(`Mensagem salva no BD:`, message);

    this.io.to(`chat_${chatId}`).emit('newMessage', message);
  }

  private async registerDisconnect(socket: Socket, userId: string) {
    console.log(`Cliente desconectado: ${socket.id}`);

    this.userConnections.forEach((sockets, uid) => {
      this.userConnections.set(
        uid,
        sockets.filter((id) => id !== socket.id),
      );

      if (this.userConnections.get(uid)?.length === 0) {
        this.userConnections.delete(uid);
      }
    });
  }
}
