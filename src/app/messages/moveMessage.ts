import { Move } from '../model/moves';
import { PlayerDetails } from '../model/playerDetails';

export class MoveMessage {
    move: Move;
	nextPlayer: PlayerDetails;
    currentPlayer: PlayerDetails;
    
    constructor(move: Move, current: PlayerDetails, next: PlayerDetails) {
        this.move = move;
        this.nextPlayer = next;
        this.currentPlayer = current;
    }
}