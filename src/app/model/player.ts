import { User } from './user';
import { TileColorEnum } from './TileColorEnum';
import { Game } from './game';
import { PlayerDetails } from './playerDetails';

export class Player {
    idPlayer: number;
	game: Game;
	playerDetails: PlayerDetails

	constructor(id: number, game: Game, details: PlayerDetails) {
		this.idPlayer = id;
		this.playerDetails = details;
		this.game = game;
	}
}


