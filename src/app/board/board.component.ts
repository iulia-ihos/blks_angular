import { Component, OnInit, ElementRef, Input, SimpleChanges, SimpleChange } from '@angular/core';
import { fabric } from 'fabric';
import { TileService } from '../service/tile.service';
import { rotateMatrix, flipX, flipY } from '../service/matrix';
import { Tile } from '../model/tile';
import { TilesService } from '../services/tiles.service';
import { TileNameEnum } from '../model/TileNameEnum';
import { TileColorEnum } from '../model/TileColorEnum';
import { WebSocketService } from '../websocket/WebSocketService';
import { TokenStorageService } from '../auth/token-storage.service';
import { Move } from '../model/move';
import { TilePosition } from '../model/tilePosition';
import { MoveMessage } from '../messages/moveMessage';
import { Game } from '../model/game';
import { PlayerDetails } from '../model/playerDetails';
import { BoardPosition } from '../model/boardPosition';
import { Position } from '../model/position';

type pos = {left: number, top: number}


@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.css']
})
export class BoardComponent implements OnInit {
	

  private canvas: any;
  private boardBoundBox;
  private blueBoundBox;
  private greenBoundBox;
  private yellowBoundBox;
  private redBoundBox;
  private box;

  private tiles: Tile[];
  private fabricTiles: fabric.Group[];
  


  constructor(private element: ElementRef, private tileService: TileService,
	private tilesService: TilesService,  private webSocket: WebSocketService,
	private tokenService: TokenStorageService
	) { }

  private tileLength = 15;
  private tilesPerLine = 20;
  
  private top = [];
  private left = [];
  private linesX = [];
  private linesY = [];
  private board = [];
  private currentTile: Tile;
  private currentFabricTile: fabric.Group;
  
  @Input() currentPlayerColor: TileColorEnum;
  @Input() game: Game;
  @Input() currentPlayer: PlayerDetails;

  ngOnInit() {	
	this.webSocket.initializeWebSocketConnection(this.tokenService.getToken());
	setTimeout(() =>{
		this.startMoveSubscription();
	  }, 1000);
    this.canvas = new fabric.Canvas('canvas', {
		//hoverCursor: 'pointer',
		selection: false,
		targetFindTolerance: 2, 
		renderOnAddRemove: false
	  });
	 this.canvas.setWidth(this.element.nativeElement.parentElement.clientWidth);
     this.canvas.setHeight(this.element.nativeElement.parentElement.clientHeight);
	
	var bbPadding = 10;

	var bbHeight = this.canvas.height*0.3;
	var bbWidth = this.canvas.width*0.32;

    this.blueBoundBox = new fabric.Rect({
		width: bbWidth,
		height: bbHeight,
		left: bbPadding,
		top: this.canvas.height - bbHeight - bbPadding,
		fill: 'transparent',
		stroke: 'black',
		selectable: false,
		hoverCursor: 'default',
	
	  });

    this.greenBoundBox = new fabric.Rect({
		width: bbWidth,
		height: bbHeight,
		left: this.canvas.width - bbWidth - bbPadding,
		top:  bbPadding,
		fill: 'transparent',
		stroke: 'black',
		selectable: false,
		hoverCursor: 'default',
	  });

    this.yellowBoundBox = new fabric.Rect({
		width: bbWidth,
		height: bbHeight,
		left: this.canvas.width - bbWidth - bbPadding,
		top:  this.canvas.height - bbHeight - bbPadding,
		fill: 'transparent',
		stroke: 'black',
		selectable: false,
		hoverCursor: 'default',
	  });

    this.redBoundBox = new fabric.Rect({
		width: bbWidth,
		height: bbHeight,
		left: bbPadding ,
		top: bbPadding,
		fill: 'transparent',
		stroke: 'black',
		selectable: false,
		hoverCursor: 'default',
	  });

	this.box = new fabric.Rect({
		width: this.canvas.height * 0.25,
		height: this.canvas.height * 0.25,
		left: 70,
		top: this.redBoundBox.top + this.redBoundBox.height + this.canvas.height * 0.05,
		fill: 'transparent',
		stroke: 'black',
		selectable: false,
		hoverCursor: 'default'
	});

    this.boardBoundBox = new fabric.Rect({
      width: 300,
      height: 300,
      fill: 'transparent',
      stroke: 'black',
	  selectable: false,
	  hoverCursor: 'default',
    });

    this.canvas.add(this.boardBoundBox);
	this.canvas.centerObject(this.boardBoundBox);
	this.canvas.add(this.greenBoundBox);
	this.canvas.add(this.redBoundBox);
	this.canvas.add(this.blueBoundBox);
	this.canvas.add(this.yellowBoundBox);
	this.canvas.add(this.box);
	this.tilesService.getAll().subscribe(data => {
		console.log(data);
		this.tiles = data;
		this.addTiles(300, 6, 30, 1);
		this.canvas.renderAll();
		this.setTilesSelectable(this.tokenService.getUsername() === this.currentPlayer.username, 
								this.currentPlayerColor);

	});
	
	this.initBox();
	this.drawBoard();

    this.canvas.on({
		'mouse:down': (e) => {
		},
		'mouse:up': (e) => {
			if(e.target == null) return;
			if(e.target.type != "group") return;
			
			if(this.isOnTheBoard(e.target)) {
				if (!this.addToBoard(e.target)) {
					this.tileService.changeOpacity(e.target, 0.5);
				}
				else {
					this.tileService.changeOpacity(e.target, 1);
					this.tileToRotate = null;
					this.canvas.remove(this.clonedTile);
					this.sendMove();
				} 		
			} else {
				
			}
		},
		'object:moving': (e) => {
			if (this.isOnTheBoard(e.target)) {
				
			var pos = this.getGroupPosition(e.target);
			let top = this.closest(this.top, e.target.top);
			let left = this.closest(this.left, e.target.left);
			e.target.set({
				top: top ,
				left: left 
			});
		}
	}
	});
	
	this.board = [];

	for ( var line = 0; line < this.tilesPerLine; line++ ) {
		this.board[ line ] = [];
		for ( var x = 0; x < this.tilesPerLine; x++ ) {
			this.board[ line ][ x ] = 0;
		}
	}	
  }

  private tileToRotate;
  private clonedTile;
	
  initBox() {
		var options = {
			left: this.box.left + 15,
			top: this.box.top +  15, 
			fontSize: 15,
			selectable: false
		}
		var instructions = new fabric.Text('Select tile', options);
		this.canvas.add(instructions);

		options.left = this.box.left + 15;
		options.top = this.box.top + 120;
		options.fontSize = 11;
		var current = new fabric.Text('Current Tile: ', options);
		this.canvas.add(current);



		//top_curved_right_arrow
        fabric.Image.fromURL("../../assets/img/curved_arrow.png", (img) => {
            img.scaleToHeight(30);
            img.scaleToWidth(30);
            img.top = this.box.top + this.box.height/2 - 30;
            img.left = this.box.left + this.box.width/2 + 10;
			img.hoverCursor = 'pointer';
			img.hasBorders = img.hasControls = img.selectable = false;

            img.on({
                'mousedown': e => {
				  // console.log("right");
				   if(this.tileToRotate)
                   this.tileService.rotate90(this.tileToRotate, 0)
                }
            });
            this.canvas.add(img);
        });

         //top_curved_left_arrow
         fabric.Image.fromURL("../../assets/img/curved_arrow.png", (img) => {
            img.scaleToHeight(30);
            img.scaleToWidth(30);
            img.flipX = true;
            img.hoverCursor = 'pointer';
            img.left = this.box.left + this.box.width/2 - 50;
			img.top = this.box.top + this.box.height/2 - 30;
			img.hasBorders = img.hasControls = img.selectable = false;
			
            img.on({
                'mousedown': e => {
					if(this.tileToRotate)
                   this.tileService.rotate90(this.tileToRotate, 1);
                }
            });
            this.canvas.add(img);
		});
		



		
		//up_down_arrow
        fabric.Image.fromURL("../../assets/img/double_arrow.png", (img) => {
            img.scaleToHeight(30);
            img.scaleToWidth(30);
            img.top = this.box.top + this.box.height/2 ;
            img.left = this.box.left + this.box.width/2 + 10;
			img.hoverCursor = 'pointer';
			img.hasBorders = img.hasControls = img.selectable = false;
			img.rotate(90);

            img.on({
                'mousedown': e => {
				   if(this.tileToRotate){
					   
					if (this.tileToRotate.angle == 0 || this.tileToRotate.angle == 180)
						this.tileToRotate.flipY = !this.tileToRotate.flipY ;
					else
					this.tileToRotate.flipX = !this.tileToRotate.flipX ;

				   }
                  
                }
            });
            this.canvas.add(img);
        });

		
		//right_left_double_arrow
        fabric.Image.fromURL("../../assets/img/double_arrow.png", (img) => {
            img.scaleToHeight(30);
            img.scaleToWidth(30);
            img.top = this.box.top + this.box.height/2;
            img.left = this.box.left + this.box.width/2 - 50;
			img.hoverCursor = 'pointer';
			img.hasBorders = img.hasControls = img.selectable = false;

            img.on({
                'mousedown': e => {
				   if(this.tileToRotate) {
					  
					if (this.tileToRotate.angle == 90 || this.tileToRotate.angle == 270)
					this.tileToRotate.flipY = !this.tileToRotate.flipY ;
					else
					this.tileToRotate.flipX = !this.tileToRotate.flipX ;
					
				   }
                }
            });
            this.canvas.add(img);
        });

	}


setTilesSelectable(userChecks: boolean, color: string) {
	if(!userChecks) {
		this.tiles.forEach(tile => {
			var fabricTile = this.tileMap.get(tile.idTile);
			fabricTile.selectable = false;
		});
	} else {
		this.tiles.forEach(tile => {
			var fabricTile = this.tileMap.get(tile.idTile);
			if(fabricTile.getObjects()[0].fill == color)
				fabricTile.selectable = true;
			else
				fabricTile.selectable = false;
		});
		
	}

}

	

  init() {
	this.tilePosition.set(TileNameEnum.i3, {top: 12, left:7});
	this.tilePosition.set(TileNameEnum.n, {top: 40, left:7});
	this.tilePosition.set(TileNameEnum.i2, {top:86, left:7});
	this.tilePosition.set(TileNameEnum.p, {top: 115, left:7});

	this.tilePosition.set(TileNameEnum.u, {top: 13, left:76});
	this.tilePosition.set(TileNameEnum.l5, {top: 76, left:59});
	this.tilePosition.set(TileNameEnum.y, {top:128, left:48});

	this.tilePosition.set(TileNameEnum.t5, {top:23, left:125});
	this.tilePosition.set(TileNameEnum.x, {top: 75, left:137});
	this.tilePosition.set(TileNameEnum.w, {top: 119, left:123});

	this.tilePosition.set(TileNameEnum.t4, {top: 12, left:173});
	this.tilePosition.set(TileNameEnum.i, {top: 55, left:190});
	this.tilePosition.set(TileNameEnum.o, {top:85, left:198});
	this.tilePosition.set(TileNameEnum.z4, {top:119, left:181});

	this.tilePosition.set(TileNameEnum.i5, {top: 8, left:255});
	this.tilePosition.set(TileNameEnum.f, {top: 29, left:228});
	this.tilePosition.set(TileNameEnum.v3, {top: 93, left:244});
	this.tilePosition.set(TileNameEnum.v5, {top: 120, left:234});

	this.tilePosition.set(TileNameEnum.l4, {top: 32, left:285});
	this.tilePosition.set(TileNameEnum.i4, {top: 72, left:275});
	this.tilePosition.set(TileNameEnum.z5, {top: 114, left:286});
	

   }

  tilePosition: Map<TileNameEnum, pos> = new Map<TileNameEnum, pos>();

  sendMove() {
	var pos = new TilePosition(0, this.currentFabricTile.top, this.currentFabricTile.left, this.currentFabricTile.angle,
		this.currentFabricTile.flipX, this.currentFabricTile.flipY);
		console.log(this.game);
	var move: Move = new Move(this.currentTile, this.game , pos);
	
	var moveMessage: MoveMessage = new MoveMessage(move, this.currentPlayer, null, this.currentBoardPosition);
	this.webSocket.sendMessage("/move", moveMessage);
	
  }

  startMoveSubscription() {
    this.webSocket.addSubscription("/game/move", (data) => {
      var message: MoveMessage = JSON.parse(data);
	   this.moveTile(this.tileMap.get(message.move.tile.idTile), message.move.position);
	   this.setTilesSelectable(this.tokenService.getUsername() === message.nextPlayer.username, 
								message.nextPlayer.color);
    });
  }

  moveTile(tile: fabric.Group, pos: TilePosition) {
	tile.left = pos.left;
	tile.top = pos.top;
	tile.angle = pos.angle;
	tile.flipX = pos.isFlippedHorizontally;
	tile.flipY = pos.isFlippedVertically
	this.canvas.renderAll();
  }

  private tileMap: Map<number, fabric.Group> = new Map<number, fabric.Group>();


  addTiles( maxLine: number, spacingT: number, spacingL: number, length) {
	  this.init();
	var tile;
	this.tiles.forEach((element, index )=> {
		var top = 0;
		var left = 0;
		switch(element.color){
			case 'red': 
				top = this.redBoundBox.top;
				left = this.redBoundBox.left;
				break;
			case 'green': 
				top = this.greenBoundBox.top;
				left = this.greenBoundBox.left;
				break;
			case 'blue':
				top = this.blueBoundBox.top;
				left = this.blueBoundBox.left;
				break;
			case 'yellow': 
				top = this.yellowBoundBox.top;
				left = this.yellowBoundBox.left;
				break;
		}
		if(this.tilePosition.get(element.tileDetails.name)) {
		var offset = this.tilePosition.get(element.tileDetails.name);
		top += offset.top;
		left += offset.left;
		tile = this.tileService.createTile(element.color, element.tileDetails.tileSquares, 
			top  , left );
		tile.on({
			'mousedown': (e) => {
				this.currentTile = element;
				this.currentFabricTile = e.target;
				if(e.target.selectable) {
					if(this.clonedTile) {
						this.canvas.remove(this.clonedTile);
					}
				e.target.clone(obj => {
					obj.left = this.box.left+90;
					obj.top = this.box.top+130;
					obj.scaleX = 0.7;
					obj.scaleY = 0.7;
					obj.selectable = false;
					obj.originX = obj.originY = 'true';
					this.clonedTile = obj;
					this.canvas.add(obj);	
				});
				
				this.tileToRotate = e.target;
			}
		}
		});
		this.tileMap.set(element.idTile, tile);
		this.canvas.add(tile);
	}
	})
  }


  noSameColorSide(colorCode): boolean {
	
	for(var i=0; i<this.currentBoardPosition.getCoords().length; i++) {
		var row = this.currentBoardPosition.getPosition(i).getTop();
		var col = this.currentBoardPosition.getPosition(i).getLeft();
			
		if(row == 0 || row == 19 || col == 0 || col == 19) continue;
			
		if(this.board[row - 1][col] == colorCode ||
			this.board[row + 1][col] == colorCode ||
			this.board[row][col - 1] == colorCode||
			this.board[row][col + 1] == colorCode)
				return false;
	}
	return true;
  } 
 
  sameColorCorner(colorCode): boolean {
	for(var i=0; i<this.currentBoardPosition.getCoords().length; i++){
		var row = this.currentBoardPosition.getPosition(i).getTop();
		var col = this.currentBoardPosition.getPosition(i).getLeft();
		console.log(row);
		console.log(col);
		if (row == 0 &&  col == 0) return true;
		if (row == 0 &&  col == 19) return true;
		if (row == 19 &&  col == 0) return true;
		if (row == 19 &&  col == 19) return true;

		if(row == 0) {
			if(this.board[row + 1][col - 1] == colorCode || this.board[row + 1][col + 1] == colorCode)
			 return true;
		}

		if(row == 19) {
			if(this.board[row - 1][col - 1] == colorCode || this.board[row - 1][col + 1] == colorCode)
			 return true;
		}

		if(col == 0) {
			if(this.board[row + 1][col + 1] == colorCode || this.board[row - 1][col + 1] == colorCode)
			 return true;
		}

		if(col == 19) { if(this.board[row + 1][col - 1] == colorCode || this.board[row - 1][col - 1] == colorCode)
			 return true;
		}

		if(row == 0 || row == 19 || col == 0 || col == 19)
			continue;

		if(this.board[row - 1][col - 1] == colorCode ||
			this.board[row - 1][col + 1] == colorCode ||
			this.board[row + 1][col - 1] == colorCode||
			this.board[row + 1][col + 1] == colorCode)
		 return true;
	}
	return false;
  }

  private checkEmpty(): boolean {
	this.currentBoardPosition.getCoords().forEach((coord) =>{
		if(this.board[coord.getTop()][coord.getLeft()] != 0) 
			return false;
		
	});
	return true;
  }

  private changeBoard(value: number) {
	this.currentBoardPosition.getCoords().forEach((coord) =>{
		this.board[coord.getTop()][coord.getLeft()] = value; 
	});
}

  private buildCoords(tileMatrix, top, left) {
	this.currentBoardPosition = new BoardPosition();
	for(var i = 0; i < tileMatrix.length; i++){
        for(var j = 0; j < tileMatrix[0].length; j++){
		  if(tileMatrix[i][j] == 1)
		  	this.currentBoardPosition.add(new Position(top+i, left+j));
        }
	  }
  }

  private getGroupPosition(group): {leftPos, topPos} {
	var leftPos = group.left;
	var topPos = group.top;
	switch(group.angle){
		case 90: 
			leftPos -= group.height;
			break;
		case 180: 
			leftPos -= group.width;
			topPos -= group.height;
			break;
		case 270: 
			topPos -= group.width;
			break;
	}
	var pos = {
		leftPos: leftPos,
		topPos: topPos
	}
	return pos;
  }

  private currentBoardPosition: BoardPosition;

  addToBoard(group): boolean {
	 console.log(this.board);
	  var tileMatrix = [];
	  var nLines = Math.floor(group.height/this.tileLength);
	  var nCols = Math.floor(group.width/this.tileLength);

	  for ( var line = 0; line < nLines; line++ ) {
		tileMatrix[ line ] = [];
		for ( var column = 0; column < nCols; column++ ) {
			tileMatrix[ line ][ column ] = 0;
		}
	}	

	var leftPos = (group.left - this.boardBoundBox.left)/this.tileLength;
	var topPos = (group.top - this.boardBoundBox.top)/this.tileLength;
	var rows = Math.floor(group.height/this.tileLength);
	var cols = Math.floor(group.width/this.tileLength);


	switch(group.angle){
		case 90: 
			leftPos -= rows;
			break;
		case 180: 
			leftPos -= cols;
			topPos -= rows;
			break;
		case 270: 
			topPos -= cols;
			break;
	}

	leftPos = Math.ceil((this.getGroupPosition(group).leftPos - this.boardBoundBox.left)/this.tileLength);
	topPos = Math.ceil((this.getGroupPosition(group).topPos - this.boardBoundBox.top)/this.tileLength);

	var objs = group.getObjects();
	  
	for(var i = 0; i<group.size(); i++) {
		var left = (objs[i].left + group.width/2 )/this.tileLength;
		var top = (objs[i].top + group.height/2 )/this.tileLength;
		tileMatrix[top][left] = 1;	
	}

	if(group.flipY) {
		tileMatrix = flipX(tileMatrix);
	}
	if(group.flipX) {
		tileMatrix = flipY(tileMatrix);
	}
	
	if(group.angle != 0) {
		tileMatrix = rotateMatrix(tileMatrix, 360 - group.angle);
	}


	console.log(tileMatrix);

	this.buildCoords(tileMatrix, topPos, leftPos);
	if(!this.checkEmpty()) {
		return false;
	}
	this.changeBoard(5);  
	var color = objs[0].fill;
	var colorCode: number;

	switch(color){
		case 'red': colorCode = 1;
		break;
		case 'green': colorCode = 2;
		break;
		case 'blue': colorCode = 3;
		break;
		case 'yellow': colorCode = 4;
		break;
		default: colorCode = 5;
	}

	if (this.noSameColorSide(colorCode) 
			&& this.sameColorCorner(colorCode)) {
		group.selectable = false;
		group.evented = false;
		this.currentBoardPosition.getCoords().forEach((coord) =>{
			this.board[coord.getTop()][coord.getLeft()] = colorCode;
		});

		return true;
	}
	this.changeBoard(0);
	return false;
	
  }


drawBoard() {
  if(this.canvas == null) return;
  let bottom = this.boardBoundBox.top + this.boardBoundBox.height;
  for(var i=0;i<=this.tilesPerLine;i++) {

    let left = this.boardBoundBox.left + (this.boardBoundBox.width/this.tilesPerLine)*i;
    let top = this.boardBoundBox.top;
   
    this.linesY.push(this.makeLine([left,top, left, bottom]));
  
    this.left.push(left);
  }

  this.linesY.forEach((line) => {
    this.canvas.add(line);
  })

  for(var i=0;i<=this.tilesPerLine;i++) {
    
    let left = this.boardBoundBox.left;
    let top = this.boardBoundBox.top + (this.boardBoundBox.height/this.tilesPerLine)*i;
    let right = this.boardBoundBox.left + this.boardBoundBox.width;

    this.linesX.push(this.makeLine([left,top, right, top]));
   
    this.top.push(top);
  }

  this.linesX.forEach((line) => {
    this.canvas.add(line);
  });

  


}

slack = 14;

isOnTheBoard(group): boolean {
   var pos = this.getGroupPosition(group);
   var width = ((group.angle == 0 ||group.angle == 180)? group.width: group.height);
   var height = ((group.angle == 0 ||group.angle == 180)? group.height: group.width);;
   console.log(pos.leftPos + width);
   console.log(this.boardBoundBox.left + this.boardBoundBox.width + this.slack);
  if (pos.leftPos < this.boardBoundBox.left - this.slack) return false;
  if (pos.topPos < this.boardBoundBox.top - this.slack) return false;
  if ((pos.leftPos + width) > (this.boardBoundBox.left + this.boardBoundBox.width + this.slack)) return false;
  if ((pos.topPos + height) > (this.boardBoundBox.top + this.boardBoundBox.height + this.slack)) return false;
 console.log("board");
  return true;
}

 makeLine(coords: number[] ) {
  return new fabric.Line(coords, {
    fill: 'white',
    stroke: 'white',
    strokeWidth: 1,
    selectable: false,
    evented: false,
  });
}
 
private closest(arr, closestTo) {
  let closest = Math.abs(closestTo - arr[0]);
  let c = 0;

  for(let i=1; i<arr.length;i++) {

    let smallest = Math.abs(closestTo - arr[i]);

    if(smallest < closest) {
      closest = smallest;
      c = i;
    }

  }
  return arr[c];
}


}

 