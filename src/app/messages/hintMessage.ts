import { TileColorEnum } from '../model/TileColorEnum';
import { TileNameEnum } from '../model/TileNameEnum';

export class HintMessage {
    left: number;
	top: number;
	username: string;
	tileName: TileNameEnum;
	idGame: number;
	color: TileColorEnum;
}