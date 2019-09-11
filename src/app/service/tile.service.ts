import {fabric} from 'fabric';
import { Injectable } from '@angular/core';
import { TileSqaures } from '../model/tileSquares';
import { TileNameEnum } from '../model/TileNameEnum';
import { Tile } from '../model/tile';

type startPosition = {top: number, left: number};
@Injectable({
 providedIn: 'root',
})
export class TileService {

    squareLength = 15;

    tilePosition: Map<TileNameEnum, startPosition> = new Map<TileNameEnum, startPosition>();

    spacing = 5;
    

    //tileOrder: TileNameEnum[];



   

    createTile(color: string, squares: TileSqaures[], top: number, left: number): fabric.Group {
        
        var options = {
            left: left,
            top: top,
            hasControls: false,
            hasBorders: false,
            perPixelTargetFind: true, 
            hoverCursor: 'pointer', 
            subTargetCheck: true,
        }
        var rectArr = [];
        squares.forEach(element => {
            rectArr.push(this.initializeRect(element.square.left,element.square.top, color));
        });
        
        var group = new fabric.Group(rectArr, options);
        return group;

    }

    private initializeRect(left: number, top: number, color: string): fabric.Rect{
        return new fabric.Rect({
            left: left*this.squareLength,
            top: top*this.squareLength,
            width: this.squareLength,
            height: this.squareLength,
            hasControls: false,
            hasBorders: false,
            perPixelTargetFind: true,
            fill: color,
            stroke: 'black', 
            selectionBackgroundColor: "white", 
          });
    }

    changeOpacity(group, opacity) {
        var objs = group.getObjects();
        for(var i = 0; i<group.size(); i++) {
            objs[i].set({opacity: opacity});
        }
      }

    //dir 0 - right, 
    rotate90(obj, dir) {
        //console.log(obj.left);
        var objCenter = obj.getCenterPoint();
        if(dir == 0){
            obj.angle = (obj.angle + 90);
            if((obj.angle == 360) ) {
                obj.angle = 0;
            }
        }
        else{
            if((obj.angle == 0) ) {
                obj.angle = 360;
            }

            obj.angle = (obj.angle - 90);
        }
       obj.setPositionByOrigin(objCenter,'center','center');
       obj.setCoords();

       
       //console.log(obj.left);
    }

}