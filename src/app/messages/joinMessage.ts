import { TileColorEnum } from '../model/TileColorEnum';

export class JoinMessage {
    idGame: number;
    username: string;
    sendTo: string;
    color: TileColorEnum;
    
    constructor(idGame: number, username: string, color: TileColorEnum, sendTo: string) {
        this.idGame = idGame;
        this.username = username;
        this.color = color;
        this.sendTo = sendTo;
    }
}

