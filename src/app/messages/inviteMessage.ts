import { TileColorEnum } from '../model/TileColorEnum';

export class InviteMessage {
    username: string;
    from: string;
    color: TileColorEnum;
    idGame: number;

    constructor(username: string, from: string, color: TileColorEnum, idGame) {
        this.username = username;
        this.from = from;
        this.color = color;
        this.idGame = idGame;
    }
}

