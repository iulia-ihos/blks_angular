import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import  * as Matter   from 'matter-js'


@Component({
  selector: 'app-canvas',
  templateUrl: './canvas.component.html',
  styleUrls: ['./canvas.component.css']
})
export class CanvasComponent implements OnInit {

  @ViewChild('canvas', { static: false })
  canvas: ElementRef<HTMLCanvasElement>; 

  @ViewChild('canvasContainer', { static: true })
  canvasContainer: ElementRef<HTMLElement>; 

  @ViewChild('greenContainer', { static: true })
  greenContainer: ElementRef<HTMLElement>; 

  private ctx: CanvasRenderingContext2D;
  private Engine = Matter.Engine;
  private Render = Matter.Render;
  private World = Matter.World;
  private Bodies = Matter.Bodies;
  private Body = Matter.Body;
  private MouseConstraint = Matter.MouseConstraint;
   
  constructor() { }

  ngOnInit() {
    //this.canvas.nativeElement.width = 400;
    //this. canvas.nativeElement.height = 400;
    //this.ctx = this.canvas.nativeElement.getContext('2d');
   
    var engine = this.Engine.create();

      var render = this.Render.create({
        element: this.canvasContainer.nativeElement,
        engine: engine,
        options: {
          width: 400,
          height: 400,
          wireframes: false
      }
      });
      var render2 = this.Render.create({
        element: this.greenContainer.nativeElement,
        engine: engine,
        options: {
          width: 400,
          height: 200,
          wireframes: false
      }
      });
      var boxA = this.Bodies.rectangle(20, 200, 1, 400);
      boxA.isStatic = true;
      var boxB = this.Bodies.rectangle(40, 200, 1, 400);
      boxB.isStatic = true;

      var boxC = this.Bodies.rectangle(200, 399.5, 400, 1);
      boxC.isStatic = true;

      var boxD = this.Bodies.rectangle(50, 50, 50, 50);
      boxD.isStatic = true;
       var tile = this.Bodies.polygon(60, 60, 8, 17);
       tile.render.sprite.texture = "../../assets/img/G_T4.png";
        this.Body.setMass(tile, 1);
       this.Body.setInertia(tile, 0);

      this.World.add(engine.world, [boxA,boxB, boxC, boxD, tile]);

      const options = {
         mouse: Matter.Mouse.create(this.canvasContainer.nativeElement)
      }
      var mouseConstraint = this.MouseConstraint.create(engine, options);
      this.World.add(engine.world, mouseConstraint);

     
      this.Engine.run(engine);
      this.Render.run(render);
      

   


  }

}
