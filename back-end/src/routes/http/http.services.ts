import { Chat, Message, Prisma, PrismaClient, User, UserChat } from '@prisma/client';
import {
  IUserBody,
  IChangeUser,
  ISearchUser,
  IResponseUserSearch,
  IChat,
  UserChatDto,
  MessageDto,
  UserChatting,
} from './dto/controller.dto';

export class HttpMethods {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  // users methods
  async getUsers(): Promise<User[]> {
    return await this.prisma.user.findMany({ orderBy: { id: 'asc' } }).catch((error) => {
      throw new Error(`Users not found: ${error}`);
    });
  }

  // mexer na mensagem
  async getLogin(body: IUserBody): Promise<Omit<User, 'profileImage'> | undefined> {
    const login = await this.prisma.user
      .findUniqueOrThrow({
        where: {
          username: body.username,
        },
        select: {
          id: true,
          username: true,
          password: true,
          chats: true,
          message: {
            orderBy: { timestamp: 'desc' },
            take: 1,
            select: {
              content: true,
              timestamp: true,
            },
          },
          profileImage: false,
          online: true,
        },
      })
      .catch((error) => {
        console.error(error);
        throw new Error(`Usuário não existe`);
      });

    if (login?.password === body.password && login.username === body.username) {
      console.log('Login bem sucedido');
      return login;
    } else if (body.username === login?.username && body.password != login?.password) {
      console.log(`Senha incorreta`);
      throw new Error(`Senha incorreta`);
    }

    // async createMessage(createMessageDto: CreateMessageDto): Promise<Message> {}
  }

  async getUserByUsername(
    searchUser: ISearchUser,
  ): Promise<{ data: IResponseUserSearch[]; currentPage: number; itemsPerPage: number; totalPages: number; totalItems: number } | null> {
    const pagination = {
      page: searchUser.page != 0 && searchUser.page ? searchUser.page - 1 : 0,
      pageSize: searchUser.pageSize ?? 6,
    };

    const [viewUsername, count] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where: {
          username: { contains: searchUser.username },
        },
        select: {
          username: true,
          id: true,
          profileImage: true,
        },
        take: pagination.pageSize,
        skip: pagination.page * pagination.pageSize,
        orderBy: {
          username: 'asc',
        },
      }),

      this.prisma.user.count({
        where: {
          username: { contains: searchUser.username },
        },
      }),
    ]);

    if (!viewUsername.length) {
      return null;
    }

    const numberPages = Math.ceil(count / pagination.pageSize);

    const orderedUsers = viewUsername.sort((a, b) => a.username.length - b.username.length);

    const allUserSearched: IResponseUserSearch[] = orderedUsers.map((user) => ({
      id: user.id,
      username: user.username,
      profileImage: user.profileImage ? Buffer.from(user.profileImage).toString('base64') : null,
    }));

    return {
      data: allUserSearched,
      currentPage: pagination.page + 1,
      itemsPerPage: pagination.pageSize,
      totalPages: numberPages,
      totalItems: count,
    };
  }

  async getUserPhoto(userId: number): Promise<string | null> {
    const user = await this.prisma.user
      .findUniqueOrThrow({
        where: {
          id: userId,
        },
        select: {
          profileImage: true,
        },
      })
      .catch((error) => {
        console.error('Erro ao buscar foto do usuário: ', error);
      });

    if (user && user.profileImage) {
      const base64Image = Buffer.from(user.profileImage).toString('base64');
      return base64Image;
    } else {
      return null;
    }
  }

  async getUserById(userId: number): Promise<User> {
    return await this.prisma.user
      .findUniqueOrThrow({
        where: {
          id: userId,
        },
      })
      .catch((error) => {
        throw new Error(`Users not found: ${error}`);
      });
  }

  async createUser(userBody: IUserBody): Promise<void> {
    const checkUsername = await this.prisma.user.findUnique({
      where: {
        username: userBody.username,
      },
    });

    if (checkUsername) {
      throw new Error(`User already exist`);
    }

    await this.prisma.user.create({
      data: {
        username: userBody.username,
        password: userBody.password,
      },
    });
  }

  async updateUser(id: number, changeUser: IChangeUser): Promise<void> {
    let updateUser: Prisma.UserUpdateInput = {};
    const { username, password } = changeUser;

    if (password && password != null) updateUser.password = password;

    if (username && username != null) {
      updateUser.username = username;

      const checkUsername = await this.prisma.user.findUnique({
        where: {
          username: username,
        },
        select: { username: true },
      });

      if (checkUsername) {
        throw new Error('Username já em uso.');
      }
    }

    await this.prisma.user.update({
      where: {
        id,
      },
      data: updateUser,
    });
  }

  async updateUserPhoto(id: number, fileBuffer: Buffer): Promise<void> {
    try {
      await this.prisma.user.update({
        where: {
          id,
        },
        data: {
          profileImage: fileBuffer,
        },
      });
    } catch (error) {
      console.error('Erro ao atualizar a foto do usuário:', error);
      throw new Error(error);
    }
  }

  async deleteUser(id: number): Promise<void> {
    await this.prisma.user
      .delete({
        where: {
          id: Number(id),
        },
      })
      .catch((error) => {
        throw new Error(error);
      });
  }

  // chat methods
  async getChats(): Promise<Chat[]> {
    return await this.prisma.chat
      .findMany({
        orderBy: { id: 'asc' },
        include: {
          chattings: true,
          messages: true,
        },
      })
      .catch((error) => {
        throw new Error(`Chats não foram encontrados: ${error}`);
      });
  }

  private async toUserDto(user: Omit<User, 'password' | 'online'>): Promise<UserChatting> {
    return {
      id: user.id,
      username: user.username,
      profileImage: user.profileImage ? Buffer.from(user.profileImage).toString('base64') : null,
    };
  }

  private async toUserChatDto(userChat: UserChat & { user: Omit<User, 'password' | 'online'> }): Promise<UserChatDto> {
    return {
      userId: userChat.userId,
      chatId: userChat.chatId,
      user: await this.toUserDto(userChat.user),
    };
  }

  private async toMessageDto(message: Message): Promise<MessageDto> {
    return {
      id: message.id,
      authorId: message.authorId,
      chatId: message.chatId,
      content: message.content,
      timestamp: message.timestamp,
      viewed: message.viewed,
    };
  }

  private async toChatUserChats(
    chat: Chat & { chattings: (UserChat & { user: Omit<User, 'password' | 'online'> })[]; messages: Message[] },
  ): Promise<IChat> {
    return {
      id: chat.id,
      title: chat.title,
      createdAt: chat.createdAt,
      isGroup: chat.isGroup,
      groupImage: chat.groupImage ? Buffer.from(chat.groupImage).toString('base64') : null,
      chattings: await Promise.all(chat.chattings.map((userChat) => this.toUserChatDto(userChat))),
      messages: await Promise.all(chat.messages.map((message) => this.toMessageDto(message))),
    };
  }

  async getUserChats(id: number): Promise<IChat[]> {
    try {
      const chatsOfUser = await this.prisma.user.findUnique({
        where: { id: Number(id) },
        select: {
          chats: {
            select: {
              chat: {
                include: {
                  messages: {
                    orderBy: { id: 'desc' },
                    take: 1,
                  },
                  chattings: {
                    include: {
                      user: {
                        select: {
                          id: true,
                          username: true,
                          profileImage: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!chatsOfUser) {
        throw new Error('Usuário não encontrado.');
      }

      const chats: IChat[] = await Promise.all(chatsOfUser.chats.map((chatData) => this.toChatUserChats(chatData.chat)));

      return chats;
    } catch (error) {
      console.error(error);
      throw new Error(error);
    }
  }

  async getChatById(id: number): Promise<Chat> {
    return await this.prisma.chat
      .findUniqueOrThrow({
        where: { id },
        include: {
          chattings: true,
          messages: true,
        },
      })
      .catch((error) => {
        throw new Error(error);
      });
  }

  async createChat(userIdSent: number, userIdReceived: number): Promise<Chat> {
    try {
      const chatAlreadyExist = await this.prisma.chat.findFirst({
        where: {
          AND: [
            {
              chattings: {
                some: {
                  userId: userIdSent,
                },
              },
            },
            {
              chattings: {
                some: {
                  userId: userIdReceived,
                },
              },
            },
          ],
        },
      });

      if (chatAlreadyExist) {
        throw new Error('Chat entre usuários já existente.');
      }

      const chat = await this.prisma.chat
        .create({
          data: {
            chattings: { create: [{ userId: userIdSent }, { userId: userIdReceived }] },
          },
        })
        .catch((error) => {
          throw new Error(`Chat creation failed: ${error.message}`);
        });

      return chat;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async deleteChat(id: number): Promise<void> {
    await this.prisma.chat
      .delete({
        where: {
          id,
        },
      })
      .catch((error) => {
        throw new Error(error);
      });
  }

  // message methods
  async createMessage(userId: number, chatId: number, content: string, timestamp: Date): Promise<Message> {
    const userInChat = await this.prisma.userChat.findUniqueOrThrow({
      where: {
        userId_chatId: {
          userId: userId,
          chatId: chatId,
        },
      },
    });

    if (!userInChat) {
      console.log('Usuário não participa do chat.');
      throw new Error('Usuário não participa do chat.');
    }

    // const timestampFormated = format(timestamp, 'dd-MM-yyyy HH:mm:ss');

    const message = await this.prisma.message
      .create({
        data: {
          authorId: userId,
          chatId: chatId,
          content: content,
          timestamp: timestamp,
        },
      })
      .catch((error) => {
        console.error(error);
        throw new Error(`Falha ao criar mensagem: ${error.message}`);
      });

    return message;
  }
}
