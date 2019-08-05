import { Component, OnInit, ElementRef } from '@angular/core';
import {fabric} from 'fabric';
import { TileService } from '../service/tile.service';



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

  private right_arrow;
  private left_arrow;
  private curved_right_arrow;
  private curved_left_arrow;
  private tileService: TileService;


  constructor(private element: ElementRef, tileService: TileService) { 
	  this.tileService = tileService;
  }

  private tileLength = 15;
private tilesPerLine = 20;
  
  private top = [];
  private left = [];
  private linesX = [];
  private linesY = [];
  private board;
  private currentTile;
  

  ngOnInit() {
    this.canvas = new fabric.Canvas('canvas', {
		hoverCursor: 'pointer',
		selection: false,
		targetFindTolerance: 2
	  });
  
    this.canvas.setWidth(this.element.nativeElement.parentElement.clientWidth);
    this.canvas.setHeight(this.element.nativeElement.parentElement.clientHeight);
	
	var bbPadding = 10;

    this.blueBoundBox = new fabric.Rect({
		width: 300,
		height: 150,
		left: bbPadding,
		top: this.canvas.height - 150 + bbPadding,
		fill: 'transparent',
		stroke: 'black',
		selectable: false
	  });

    this.greenBoundBox = new fabric.Rect({
		width: 300,
		height: 150,
		left: this.canvas.width - 300 + bbPadding,
		top:  bbPadding,
		fill: 'transparent',
		stroke: 'black',
		selectable: false
	  });

    this.yellowBoundBox = new fabric.Rect({
		width: 300,
		height: 150,
		left: this.canvas.width - 300 + bbPadding,
		top:  this.canvas.height - 150 + bbPadding,
		fill: 'transparent',
		stroke: 'black',
		selectable: false
	  });

    this.redBoundBox = new fabric.Rect({
		width: 300,
		height: 150,
		left: bbPadding ,
		top: bbPadding,
		fill: 'transparent',
		stroke: 'black',
		selectable: false
	  });

    this.boardBoundBox = new fabric.Rect({
      width: 300,
      height: 300,
      fill: 'transparent',
      stroke: 'black',
      selectable: false
    });

    this.canvas.add(this.boardBoundBox);
	this.canvas.centerObject(this.boardBoundBox);
	this.canvas.add(this.greenBoundBox);
	this.addTiles("green", this.greenBoundBox.top, this.greenBoundBox.left, 7, 10);
	this.canvas.add(this.redBoundBox);
	this.addTiles("red", this.redBoundBox.top, this.redBoundBox.left, 7, 10);
	this.canvas.add(this.blueBoundBox);
	this.addTiles("blue", this.blueBoundBox.top, this.blueBoundBox.left, 7, 10);
	this.canvas.add(this.yellowBoundBox);
	this.addTiles("yellow", this.yellowBoundBox.top, this.yellowBoundBox.left, 7, 10);
	this.drawBoard();

	

    this.boardBoundBox.on({
     
    })
   
    this.canvas.on({
	  'mouse:down': (e) => {
		if(e.target == null) return;
		if(e.target.type == "group") {
			if(e.target == this.currentTile) return;
			if(this.currentTile) {
				this.tileService.toggleArrowsVisibility(this.currentTile, false);
			}
			
			this.currentTile = e.target;
			this.tileService.toggleArrowsVisibility(e.target, true);
		}
	  },
      'mouse:up': (e) => {
		if(e.target == null) return;
		if(e.target.type != "group") return;
		 // console.log(e.target.top + " " + e.target.height);
		  //console.log(e.target.getObjects()[0].height);
		if(this.isOnTheBoard(e.target)) {
			if (!this.addToBoard(e.target)) {
				this.tileService.changeOpacity(e.target, 0.5);
			}
			else {
				this.tileService.changeOpacity(e.target, 1);
				
			} 
				
		}
		
      },
      'object:moving': (e) => {
	  if (this.isOnTheBoard(e.target)) {
		  
		let top = this.closest(this.top, e.target.top);
		let left = this.closest(this.left, e.target.left);

		e.target.set({
		  top: top,
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

  private tileConfig = [
	  [[1,0],[0,1],[1,1],[2,1]],
	  [[0,0]]
  ];
  addTiles(color: string, top: number, left: number, nrPerLine: number, spacing: number) {
	this.tileConfig.forEach((coords, index )=> {
		this.canvas.add(this.tileService.createTile(color, coords, top + (index/nrPerLine)*75, left + (index%nrPerLine)*75));
	})
  }
  

  

  

  sameColorSide(left, top, width, height, colorCode): boolean {
	//console.log(left - this.boardBoundBox.left, top - this.boardBoundBox.top, width, height);
	var col = (left - this.boardBoundBox.left)/this.tileLength;
	var row = (top - this.boardBoundBox.top)/this.tileLength;
	var rLength = row + height/this.tileLength;
	var cLength = col + width/this.tileLength;
	//console.log("row " + rLength + " " + cLength);
	console.log("row " + row + " " + col);
	
	for(var i = row; i<=rLength; i++ ) {
		for(var j = col; j<=cLength; j++) {
			console.log(i + " " + j);
			if(i == 0 || i == 19 || j == 0 || j == 19) continue;
			if(this.board[i][j] != 5) continue;
			
			if(this.board[i - 1][j] == colorCode ||
				this.board[i + 1][j] == colorCode ||
				this.board[i][j - 1] == colorCode||
				this.board[i][j + 1] == colorCode)
			 return false
		}
	}
	return true;
  } 
 
  sameColorCorner(colorCode): boolean {
	var hasSameColorCorner = false;

	for(var i=0; i<this.currentCoords.length; i++){
		var row = this.currentCoords[i][0];
		var col = this.currentCoords[i][1];

		if (row == 0 &&  col == 0) return true;
		if (row == 0 &&  col == 19) return true;
		if (row == 19 &&  col == 0) return true;
		if (row == 19 &&  col == 19) return true;

		if(row == 0 || row == 19 || col == 0 || col == 19) continue;

		if(this.board[row - 1][col - 1] == colorCode ||
			this.board[row - 1][col + 1] == colorCode ||
			this.board[row + 1][col - 1] == colorCode||
			this.board[row - 1][col + 1] == colorCode)
		 return true
	}
	return false;
  }

  currentCoords;
  addToBoard(group): boolean {
	console.log(group.type);
	  var objs = group.getObjects();
	  this.currentCoords = [];
	for(var i = 0; i<group.size(); i++) {
		if(objs[i].type == "image") continue;
		
		var left = objs[i].left + (group.width/2) + group.left - this.boardBoundBox.left;
		var top = objs[i].top + (group.height/2) + group.top - this.boardBoundBox.top;
		var row = top/this.tileLength;
		var column = left/this.tileLength;
		if(this.board[row][column] != 0) {
			return false;
		}	
		
		this.currentCoords.push([row,column]);
	}
	//console.log(this.currentCoords);
	this.currentCoords.forEach((coord) =>{

		this.board[coord[0]][coord[1]] = 5;
		//console.log(this.board[coord[0]][coord[1]]);
		
	});

	var color = objs[0].fill;
	var colorCode;

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

	if (this.sameColorSide(group.left, group.top, group.width, group.height, colorCode) 
			&& this.sameColorCorner(colorCode)) {
	
		group.selectable = false;
		group.evented = false;
		this.currentCoords.forEach((coord) =>{
			
			this.board[coord[0]][coord[1]] = colorCode;
			//console.log(this.board[coord[0]][coord[1]]);
		});


	
		console.log(this.board);
		//console.log(group);
		return true;
	}
	this.currentCoords.forEach((coord) =>{
			
		this.board[coord[0]][coord[1]] = 0;
	});
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

isOnTheBoard(el): boolean {
  if (el.left < this.boardBoundBox.left) return false;
  if (el.top < this.boardBoundBox.top) return false;
  if ((el.left + el.width) > (this.boardBoundBox.left + this.boardBoundBox.width)) return false;
  if ((el.top + el.height) > (this.boardBoundBox.top + this.boardBoundBox.height)) return false;
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
