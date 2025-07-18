export interface IUserBody {
  username: string;
  password: string;
  profileImage?: string | null;
}

export interface IChangeUser {
  username?: string;
  password?: string;
  profileImage?: string;
}

export interface ISearchUser {
  page?: number;
  pageSize?: number;
  username?: string;
}

export interface IResponseUserSearch {
  id: number;
  username: string;
  profileImage?: string | null;
}

// Dto do chat

export interface IChat {
  id: number;
  title?: string | null;
  createdAt: Date;
  isGroup: boolean;
  userDeletedChat: string[];
  deletedUser: string[];
  groupImage: string | null;
  chattings: UserChatDto[];
  messages: MessageDto[];
}

export interface UserChatDto {
  userId: number;
  chatId: number;
  user: UserChatting;
}

export interface UserChatting {
  id: number;
  username: string;
  profileImage: string | null;
}

export interface MessageDto {
  id: number;
  authorId: number;
  chatId: number;
  content: string;
  timestamp: Date;
  viewed: boolean;
}
