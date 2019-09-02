import { User } from './user';
import { Move } from './moves';
import { Player } from './player';

export class Game {
    idGame: number;
	startTime?: Date;
	endTime?: Date;
	winner?: User;
	players?: Player[];
    moves?: Move[];
}