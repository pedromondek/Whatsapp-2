import { Server, Socket } from 'socket.io';
import http from 'http';
import { PrismaClient } from '@prisma/client';
import { HttpMethods } from '../http/http.services';

export class WebSocketService {
  private io: Server;
  private servicesMethods: HttpMethods;
  private userConnections: Map<number, string[]>;

  constructor(server: http.Server, prisma: PrismaClient) {
    this.servicesMethods = new HttpMethods(prisma);
    this.userConnections = new Map();

    this.io = new Server(server, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST', 'DELETE'],
      },
    });

    this.socketEvents();
  }

  private async socketEvents(): Promise<void> {
    this.io.on('connection', (socket: Socket) => {
      socket.on('registerConnection', ({ userId }) => {
        socket.data.userId = userId;

        this.registerConnection(socket, userId);
        this.joinChats(socket);
      });

      socket.on('message', async ({ userId, chatId, content }) => this.newMessage(socket, userId, chatId, content));

      socket.on('disconnect', () => {
        this.registerDisconnect(socket, socket.data.userId);
      });

      socket.on('newChat', async ({ chatId, chattingsId }) => this.newChat(socket, chatId, chattingsId));

      socket.on('newChatNotification', async ({ chatId }) => {
        console.log(`Usuário(s) notificado(s) sobre novo chat ${chatId}.`);
      });

      socket.on('userExitChat', async ({ chatId }) => {
        socket.to(`chat_${chatId}`).emit('userExitChat');
      });
    });
  }

  private async newChat(socket: Socket, chatId: number, chattingsId: number[]): Promise<void> {
    let chatsId: number[] = socket.data.chatsId || [];

    if (!chatsId.includes(chatId)) {
      chatsId.push(chatId);
      socket.data.chatsId = chatsId;
      socket.join(`chat_${chatId}`);
      console.log(`Usuário ${socket.data.userId} entrou no novo chat: chat_${chatId}`);
    }

    chattingsId.forEach((chatting) => {
      const chattingsSocket = this.userConnections.get(Number(chatting));
      if (chattingsSocket && chattingsSocket.length > 0 && chattingsSocket != undefined) {
        chattingsSocket.forEach((socketId) => {
          console.log('Socketid:', socketId);
          this.io.to(socketId).emit('newChatNotification', { chatId });
          console.log(`Notificando ${socketId} de novo chat ${chatId}`);
        });
      } else {
        console.log(`Usuário ${chatting} não está conectado para receber notificação do novo chat.`);
      }
    });
  }

  private async joinChats(socket: Socket): Promise<void> {
    socket.on('joinChats', async ({ chatsId }) => {
      if (!socket.data.chatsId) {
        socket.data.chatsId = chatsId;
      } else {
        const newChats = chatsId.filter((chatId: number) => !socket.data.chatsId.includes(chatId));

        if (newChats.length === 0) {
          console.log(`Usuário ${socket.data.userId} já está em todos os chats informados.`);
          return;
        }

        socket.data.chatsId.push(...newChats);
      }
      // socket.data.chatsId = chatsId;

      for (const chatId of socket.data.chatsId) {
        socket.join(`chat_${chatId}`);
        const onlineUsers = await this.getOnlineUsersOnChat(chatId);
        socket.emit('alreadyOnline', onlineUsers);
        console.log(`Usuário socket.id: ${socket.id}, entrou na sala: chat_${chatId}`);
      }
      this.showOnlineUser(socket);
    });
  }

  private async getOnlineUsersOnChat(chatId: number): Promise<string[]> {
    const chat = this.io.sockets.adapter.rooms.get(`chat_${chatId}`);
    const onlineUsersOnChat: string[] = [];

    if (chat) {
      chat.forEach((socketId) => {
        const socketUser = this.io.sockets.sockets.get(socketId);
        if (socketUser && socketUser.data.userId && !onlineUsersOnChat.includes(socketUser.data.userId)) {
          onlineUsersOnChat.push(socketUser.data.userId);
        }
      });
    }
    console.log(`UIDs conectados no chatId ${chatId}: `, onlineUsersOnChat);

    // console.log(onlineUsersOnChat instanceof Array);
    // const onlineUsers = Object.values(onlineUsersOnChat);
    // const onlineUsers = Array.from(onlineUsersOnChat.values());
    // console.log(`UIDs conectados no chatId ${chatId}: `, onlineUsers);
    // console.log(onlineUsers instanceof Array);

    // return onlineUsers;
    return onlineUsersOnChat;
  }

  private async registerConnection(socket: Socket, userId: string) {
    if (!userId) {
      console.warn(`Tentativa de conectar sem userId! socket.id: ${socket.id}`);
      return;
    }

    if (this.userConnections.has(Number(userId))) {
      this.userConnections.get(Number(userId))?.push(socket.id);
    } else {
      if (userId !== undefined) {
        this.userConnections.set(Number(userId), [socket.id]);
      } else {
        console.warn(`UserId indefinido do socket: ${socket.id}`);
        return;
      }
    }

    try {
      await this.servicesMethods.userConnect(Number(userId));
    } catch (error) {
      console.error(error);
      console.log(`Ocorreu um erro ao conectar ${socket.id} de ID ${userId}: ${error.message}`);
    }

    console.log(`Usuários conectados: ${this.userConnections.get(Number(userId))}`);
    console.log(`Usuário ${userId} registrado com socket.id: ${socket.id}`);
  }

  private async showOnlineUser(socket: Socket) {
    const chatsId = socket.data.chatsId;
    const userId = socket.data.userId;
    // console.log('CID: ', chatsId);
    // console.log('UID: ', userId);

    chatsId.forEach((chatId: number) => {
      // const onlineUsers = this.getOnlineUsersOnChat(chatId);
      // console.log(onlineUsers);
      socket.to(`chat_${chatId}`).emit('userOnline', userId);
      console.log(`O usuário de ID ${userId} está online para o chat ${chatId}`);
    });
    // }
  }

  private async registerDisconnect(socket: Socket, userId: string) {
    if (!userId) {
      console.warn(`Tentativa de desconectar sem userId! socket.id: ${socket.id}`);
      return;
    }
    try {
      await this.servicesMethods.userDisconnect(Number(userId));

      const chatsId = socket.data.chatsId;

      chatsId.forEach((chatId: number) => {
        socket.to(`chat_${chatId}`).emit('userOffline', userId);
      });
      // }
    } catch (error) {
      console.log(`Ocorreu um erro ao desconectar ${socket.id} de ID ${userId}: ${error.message}`);
    }

    this.userConnections.forEach((sockets, uid) => {
      this.userConnections.set(
        uid,
        sockets.filter((id) => id !== socket.id),
      );

      if (this.userConnections.get(uid)?.length === 0) {
        this.userConnections.delete(uid);
      }
    });

    console.log(`Usuário ${userId} desconectado: ${socket.id}`);
  }

  private async newMessage(socket: Socket, userId: number, chatId: number, content: string) {
    const message = await this.servicesMethods.createMessage(userId, chatId, content);

    console.log(`Mensagem salva no BD:`, message);

    this.io.to(`chat_${chatId}`).emit('newMessage', message);
  }
}
