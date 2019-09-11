import { TileColorEnum } from '../model/TileColorEnum';
import { Player } from '../model/player';

export class PlayersMessage {
    players: Player[];

    constructor(players: Player[]) {
        this.players = players;
    }
}

