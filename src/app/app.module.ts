import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { FormsModule }   from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ToastrModule } from 'ngx-toastr';
import { MatCheckboxModule } from '@angular/material/checkbox';

import { AppComponent } from './app.component';
import { BoardComponent } from './board/board.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { HttpConfigInterceptor } from './auth/auth-interceptor';
import { MainComponent } from './main/main.component';
import { GameComponent } from './game/game.component';
import { LeaderboardComponent } from './leaderboard/leaderboard.component';
import { PlayersSelectorComponent } from './players-selector/players-selector.component';
import { from } from 'rxjs';

@NgModule({
  declarations: [
    AppComponent,
    BoardComponent,
    LoginComponent,
    RegisterComponent,
    MainComponent,
    GameComponent,
    LeaderboardComponent,
    PlayersSelectorComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    FlexLayoutModule,
    FormsModule,
    HttpClientModule,
    NgbModule, 
    ToastrModule.forRoot(),
    MatCheckboxModule
   
  ],

  providers:[
    { provide: HTTP_INTERCEPTORS, useClass: HttpConfigInterceptor, multi: true },
    ],
  
  bootstrap: [AppComponent]
})
export class AppModule { }
