import { TilePosition } from './tilePosition';
import { Game } from './game';
import { Tile } from './tile';

export class Move {

    tile: Tile;
    game: Game;
    position: TilePosition;
    
    constructor(tile: Tile, game: Game, position: TilePosition) {
        this.tile = tile;
        this.game = game;
        this.position = position;
    }
}