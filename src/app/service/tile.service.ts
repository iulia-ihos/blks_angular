import {fabric} from 'fabric';
import { Injectable } from '@angular/core';

@Injectable({
 providedIn: 'root',
})
export class TileService{

    squareLength = 15;

    createTile(color: string, squareCoords, top: number, left: number): fabric.Group {
        var options = {
            left: left,
            top: top,
            hasControls: false,
            hasBorders: false,
            perPixelTargetFind: true
        }
        var rectArr = [];
        squareCoords.forEach(element => {
            rectArr.push(this.initializeRect(element[0],element[1], color));
        });

        var group = new fabric.Group(rectArr, options);
        this.addArrows(group);
        return group;

    }

    private initializeRect(x: number, y: number, color: string): fabric.Rect{
        return new fabric.Rect({
            left: x*this.squareLength,
            top: y*this.squareLength,
            width: this.squareLength,
            height: this.squareLength,
            hasControls: false,
            hasBorders: false,
            perPixelTargetFind: true,
            fill: color,
            stroke: 'black'
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
        if(dir == 0){
            obj.rotate(90);
        }
        else
            obj.rotate(-90);
    }

    toggleArrowsVisibility(group, visible: boolean) {
        console.log(visible);
        var objs = group.getObjects();
        objs.forEach((obj) => {
            if(obj.type == "image")
            obj.visible = visible;
        })
      }
    
      arrowsLeftOffset = 10;
      arrowsTopOffset = 5;
    
    private  addArrows(group) {
    
        //curved_right_arrow
        fabric.Image.fromURL("../../assets/img/curved_arrow.png", (img) => {
            img.scaleToHeight(20);
            img.scaleToWidth(20);
            img.top = - group.height/2 - this.arrowsTopOffset;
            img.left = group.width/2 -  this.arrowsLeftOffset;
            img.visible = false;
            group.add(img);
        });
    
        //left_arrow
        fabric.Image.fromURL("../../assets/img/right_arrow.png", (img) => {
            img.flipX = true;
            img.scaleToHeight(20);
            img.scaleToWidth(20);
            img.left = group.width/2  - this.arrowsLeftOffset;
            img.top = group.height/2 - this.arrowsTopOffset;
            img.visible = false;
            group.add(img);
        });
    
        //right_arrow
        fabric.Image.fromURL("../../assets/img/right_arrow.png", (img) => {
            img.scaleToHeight(20);
            img.scaleToWidth(20);
            img.left = - group.width/2 - this.arrowsLeftOffset;
            img.top = group.height/2 - this.arrowsTopOffset;
            img.visible = false;
            group.add(img);
          });
    
        //curved_left_arrow
        fabric.Image.fromURL("../../assets/img/curved_arrow.png", (img) => {
            img.scaleToHeight(20);
            img.scaleToWidth(20);
            img.flipX = true;
            img.left = - group.width/2 - this.arrowsLeftOffset;
            img.top = - group.height/2 - this.arrowsTopOffset;
            img.visible = false;
            group.add(img);
        });
    
        
    console.log(group);
      }
}