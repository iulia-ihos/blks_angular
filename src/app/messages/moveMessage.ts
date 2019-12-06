import { Move } from '../model/move';
import { PlayerDetails } from '../model/playerDetails';
import { BoardPosition } from '../model/boardPosition';

export class MoveMessage {
    move: Move;
	nextPlayer: PlayerDetails;
    currentPlayer: PlayerDetails;
    boardPosition : BoardPosition
    
    constructor(move: Move, current: PlayerDetails, next: PlayerDetails, boardPosition) {
        this.move = move;
        this.nextPlayer = next;
        this.currentPlayer = current;
        this.boardPosition = boardPosition;
    }
}