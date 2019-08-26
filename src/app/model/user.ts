import { RolesEnum } from './RolesEnum';

export class User {
    idUser: number;
    username?: string;
    email?: string;
    role?: RolesEnum;
    password?: string;
}