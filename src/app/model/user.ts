import { RolesEnum } from './RolesEnum';

export class User {
    idUser: number;
    email?: string;
    role?: RolesEnum;
    password?: string;
}