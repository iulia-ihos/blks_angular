import { User } from './user';
import { TileColorEnum } from './TileColorEnum';

export class PlayerDetails {
    idPlayerDetails: number;
	username: string;
	points: number;
	color: TileColorEnum;

	constructor(id: number, username: string, color: TileColorEnum, points: number) {
		this.idPlayerDetails = id;
		this.username = username;
		this.color = color;
		this.points = points;
	}
}