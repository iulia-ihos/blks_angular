import { Component, OnInit, ElementRef } from '@angular/core';
import {fabric} from 'fabric';
import { TileService } from '../service/tile.service';
import {scale, rotate, translate, applyToPoint, toString} from 'transformation-matrix';
import { rotateMatrix } from '../service/matrix';
import { groupBy } from 'rxjs/internal/operators/groupBy';



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
  private board = [];
  private currentTile;
  

  ngOnInit() {
    this.canvas = new fabric.Canvas('canvas', {
		//hoverCursor: 'pointer',
		selection: false,
		targetFindTolerance: 2, 
		renderOnAddRemove: false
	  });
  console.log(this.element.nativeElement);
	 this.canvas.setWidth(this.element.nativeElement.parentElement.clientWidth);
     this.canvas.setHeight(this.element.nativeElement.parentElement.clientHeight);
	
	var bbPadding = 10;

    this.blueBoundBox = new fabric.Rect({
		width: 300,
		height: 150,
		left: bbPadding,
		top: this.canvas.height - 150 - bbPadding,
		fill: 'transparent',
		stroke: 'black',
		selectable: false,
		hoverCursor: 'default',
	
	  });

    this.greenBoundBox = new fabric.Rect({
		width: 300,
		height: 150,
		left: this.canvas.width - 300 - bbPadding,
		top:  bbPadding,
		fill: 'transparent',
		stroke: 'black',
		selectable: false,
		hoverCursor: 'default',
	  });

    this.yellowBoundBox = new fabric.Rect({
		width: 300,
		height: 150,
		left: this.canvas.width - 300 - bbPadding,
		top:  this.canvas.height - 150 - bbPadding,
		fill: 'transparent',
		stroke: 'black',
		selectable: false,
		hoverCursor: 'default',
	  });

    this.redBoundBox = new fabric.Rect({
		width: 300,
		height: 150,
		left: bbPadding ,
		top: bbPadding,
		fill: 'transparent',
		stroke: 'black',
		selectable: false,
		hoverCursor: 'default',
	  });

	this.box = new fabric.Rect({
		width: 150,
		height: 150,
		left: 70,
		top: this.redBoundBox.top + this.redBoundBox.height + 15,
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
	this.addTiles("green", this.greenBoundBox.top, this.greenBoundBox.left, 7, 10);
	this.canvas.add(this.redBoundBox);
	this.addTiles("red", this.redBoundBox.top, this.redBoundBox.left, 7, 10);
	this.canvas.add(this.blueBoundBox);
	this.addTiles("blue", this.blueBoundBox.top, this.blueBoundBox.left, 7, 10);
	this.canvas.add(this.yellowBoundBox);
	this.addTiles("yellow", this.yellowBoundBox.top, this.yellowBoundBox.left, 7, 10);
	this.canvas.add(this.box);
	this.initBox();
	this.drawBoard();

	

    this.boardBoundBox.on({
     
    })
   
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
				} 		
			} else {
				
			}
		},
		'object:moving': (e) => {
			if (this.isOnTheBoard(e.target)) {
				
			var pos = this.getGroupPosition(e.target);
			// console.log(pos);
			// console.log(this.left);
			let top = this.closest(this.top, e.target.top);
			let left = this.closest(this.left, e.target.left);

			// let top = this.closest(this.top, pos.topPos);
			// let left = this.closest(this.left, pos.leftPos);

			e.target.set({
				top: top ,
				left: left //+ e.target.height
			});
		}else console.log("no")
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
					// console.log(this.tileToRotate.angle);
					// console.log(this.tileToRotate.flipX);
					// console.log(this.tileToRotate.flipY);

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

  private tileConfig = [
	  [[1,0],[0,1],[1,1],[2,1]],
	  [[0,0]]
  ];

  addTiles(color: string, top: number, left: number, nrPerLine: number, spacing: number) {
	this.tileConfig.forEach((coords, index )=> {
		var tile = this.tileService.createTile(color, coords, top + (index/nrPerLine)*75 , left + (index%nrPerLine)*75);
		tile.on({
			'mousedown': (e) => {
				//console.log(e);
				if(this.clonedTile) {
					this.canvas.remove(this.clonedTile);
					//console.log(this.clonedTile);
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
		});
		this.canvas.add(tile);
	})
  }


  noSameColorSide(colorCode): boolean {
	
	for(var i=0; i<this.currentCoords.length; i++) {
		var row = this.currentCoords[i][0];
		var col = this.currentCoords[i][1];
			
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
			this.board[row + 1][col + 1] == colorCode)
		 return true
	}
	return false;
  }

  private checkEmpty(): boolean {
	this.currentCoords.forEach((coord) =>{
		if(this.board[coord[0]][coord[1]] != 0) 
			return false;
		
	});
	return true;
  }

  private changeBoard(value: number) {
	this.currentCoords.forEach((coord) =>{
		this.board[coord[0]][coord[1]] = value; 
	});
}

  private buildCoords(tileMatrix, top, left) {
	//   console.log("top " + top);
	//   console.log("left " + left);
	this.currentCoords = [];
	for(var i = 0; i < tileMatrix.length; i++){
        for(var j = 0; j < tileMatrix[0].length; j++){
		  if(tileMatrix[i][j] == 1)
		  	this.currentCoords.push([top+i, left+j]);
        }
	  }
  }

  private getGroupPosition(group): {leftPos, topPos}{

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

  private currentCoords;

  addToBoard(group): boolean {
	 
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

	// console.log("left"+leftPos);
	// console.log("top "+ topPos);
	leftPos = Math.ceil((this.getGroupPosition(group).leftPos - this.boardBoundBox.left)/this.tileLength);
	topPos = Math.ceil((this.getGroupPosition(group).topPos - this.boardBoundBox.top)/this.tileLength);
	// console.log("left"+leftPos);
	// console.log("top "+ topPos);
	
	  var objs = group.getObjects();
	  
	 

	  
	
	  //console.log("w "+group.left);

	for(var i = 0; i<group.size(); i++) {
		// if(objs[i].type == "image") continue;
		

		var left = (objs[i].left + group.width/2 )/this.tileLength;
		var top = (objs[i].top + group.height/2 )/this.tileLength;

		tileMatrix[top][left] = 1;
		
		// var left =  group.left + objs[i].left + group.width/2 - this.boardBoundBox.left;
		// var top = group.top +  objs[i].top + group.height/2 - this.boardBoundBox.top;

		// var left =  groupLeft + objs[i].left + group.width/2 - this.boardBoundBox.left;
		// var top = groupTop +  objs[i].top + group.height/2 - this.boardBoundBox.top;
		
		// var row = top/this.tileLength;
		// var column = left/this.tileLength;
		//console.log(left+ " "+top);
		//this.currentCoords.push([top,left]);
	}
	
	// var transformedMatrix = rotateMatrix(tileMatrix, 360 - group.angle);
	// console.log(transformedMatrix);
	if(group.angle != 0) {
		tileMatrix = rotateMatrix(tileMatrix, 360 - group.angle);
	}
	// console.log(group.flipY);
	// console.log(group.flipX);
	if(group.flipY) {
		tileMatrix = rotateMatrix(tileMatrix, 180);
	}
	if(group.flipX) {
		tileMatrix = rotateMatrix(tileMatrix, 180);
	}

	
	//console.log(tileMatrix);

	this.buildCoords(tileMatrix, topPos, leftPos);
	if(!this.checkEmpty()) {
		//console.log("not empty");
		return false;
	}
	console.log(this.currentCoords);
	this.changeBoard(5);  
	console.log(this.board);


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

	//console.log("same side " + this.noSameColorSide(colorCode));
	//console.log("same corner " + this.sameColorCorner(colorCode) );

	if (this.noSameColorSide( colorCode) 
			&& this.sameColorCorner(colorCode)) {
	
		group.selectable = false;
		group.evented = false;
		this.currentCoords.forEach((coord) =>{
			
			this.board[coord[0]][coord[1]] = colorCode;
			//console.log(this.board[coord[0]][coord[1]]);
		});


	
	
		//console.log(group);
		return true;
	}
	this.changeBoard(0);
	return false;
	
  }


drawBoard() {
	console.log(this.board);
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

slack = 20;

isOnTheBoard(group): boolean {
   var pos = this.getGroupPosition(group);
  if (pos.leftPos < this.boardBoundBox.left - this.slack) return false;
  if (pos.topPos < this.boardBoundBox.top - this.slack) return false;
  if ((pos.leftPos + group.width) > (this.boardBoundBox.left + this.boardBoundBox.width + this.slack)) return false;
  if ((pos.topPos + group.height) > (this.boardBoundBox.top + this.boardBoundBox.height + this.slack)) return false;
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
