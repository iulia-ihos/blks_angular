import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { BoardComponent } from './board/board.component';
import { MainComponent } from './main/main.component';
import { GameComponent } from './game/game.component';
import { PlayersSelectorComponent } from './players-selector/players-selector.component';

const routes: Routes = [
  {path:'', component: MainComponent},
  {path:'login', component: LoginComponent},
  {path:'logout', component: LoginComponent},
  {path:'register', component: RegisterComponent},
  {path:'new-game/:id', component: GameComponent},
  {path:'test', component: BoardComponent},
  {path:'players', component: PlayersSelectorComponent},
 
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
