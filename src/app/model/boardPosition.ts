import { Position } from './position';

export class BoardPosition {
    private coords: Position[];

    constructor() {
        this.coords = [];
    }

    add(position: Position) {
        this.coords.push(position);
    }

    getCoords() {
        return this.coords;
    }

    getPosition(index: number): Position {
        return this.coords[index];
    }
}