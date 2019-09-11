
export class BoardPosition {

    idBoardPosition: number;
	top: number;
	left: number;
	angle: number;
	isFlippedHorizontally: boolean;
	isFlippedVertically: boolean;

	constructor(idBoardPosition:0, top: number, left: number, angle: number,
				isFlippedHorrizontally: boolean, isFlippedVertically: boolean) {
		this.idBoardPosition = idBoardPosition;
		this.top = top;
		this.left = left;
		this.angle = angle;
		this.isFlippedHorizontally = isFlippedHorrizontally;
		this.isFlippedVertically = isFlippedVertically;
		}
}