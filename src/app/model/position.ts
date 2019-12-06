export class Position {
    private top: number;
    private left: number;

    constructor(top: number, left: number) {
        this.top = top;
        this.left = left;
    }

    getTop() {
        return this.top;
    }

    getLeft() {
        return this.left;
    }
}