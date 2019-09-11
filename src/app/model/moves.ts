import { BoardPosition } from './boardPosition';
import { Game } from './game';
import { Tile } from './tile';

export class Move {

    tile: Tile;
    game: Game;
    position: BoardPosition;
    
    constructor(tile: Tile, game: Game, position: BoardPosition) {
        this.tile = tile;
        this.game = game;
        this.position = position;
    }
}