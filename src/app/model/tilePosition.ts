
export class TilePosition {

    idTilePosition: number;
	top: number;
	left: number;
	angle: number;
	isFlippedHorizontally: boolean;
	isFlippedVertically: boolean;

	constructor(idTilePosition:0, top: number, left: number, angle: number,
				isFlippedHorrizontally: boolean, isFlippedVertically: boolean) {
		this.idTilePosition = idTilePosition;
		this.top = top;
		this.left = left;
		this.angle = angle;
		this.isFlippedHorizontally = isFlippedHorrizontally;
		this.isFlippedVertically = isFlippedVertically;
		}
}