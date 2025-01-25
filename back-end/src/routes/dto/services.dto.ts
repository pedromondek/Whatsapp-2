export interface IUserBody {
    username: string;
    password: string;
}

export interface IChangeUser {
    username?: string;
    password?: string;
    profileImage?: string
}
