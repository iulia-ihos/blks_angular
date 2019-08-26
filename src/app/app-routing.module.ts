import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { AppComponent } from './app.component';
import { CanvasComponent } from './canvas/canvas.component';
import { BoardComponent } from './board/board.component';
import { MainComponent } from './main/main.component';

const routes: Routes = [
  {path:'', component: MainComponent},
  {path:'login', component: LoginComponent},
  {path:'logout', component: LoginComponent},
  {path:'register', component: RegisterComponent},
  {path:'new-game', component: BoardComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
