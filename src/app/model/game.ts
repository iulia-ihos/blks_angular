import { User } from './user';
import { Move } from './move';
import { Player } from './player';

export class Game {
    idGame: number;
	startTime?: Date;
	endTime?: Date;
	winner?: User;
	players?: Player[];
	moves?: Move[];
	status: string
	
	constructor(idGame: number, status: string) {
		this.status = status;
		this.idGame = idGame;
	}
}