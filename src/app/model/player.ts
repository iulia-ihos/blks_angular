import { User } from './user';
import { TileColorEnum } from './TileColorEnum';
import { Game } from './game';

export class Player {
    user: User;
	game: Game;
	color: TileColorEnum;
	points: number;
}