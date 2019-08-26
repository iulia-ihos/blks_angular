import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { FormsModule }   from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import {HttpClientModule, HTTP_INTERCEPTORS} from '@angular/common/http';

import { AppComponent } from './app.component';
import { BoardComponent } from './board/board.component';
import { TilesComponent } from './tiles/tiles.component';
import { CanvasComponent } from './canvas/canvas.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { HttpConfigInterceptor } from './auth/auth-interceptor';
import { MainComponent } from './main/main.component';

@NgModule({
  declarations: [
    AppComponent,
    BoardComponent,
    TilesComponent,
    CanvasComponent,
    LoginComponent,
    RegisterComponent,
    MainComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FlexLayoutModule,
    FormsModule,
    HttpClientModule,
  ],

  providers:[{provide: HTTP_INTERCEPTORS, useClass: HttpConfigInterceptor, multi: true}],
  
  bootstrap: [AppComponent]
})
export class AppModule { }
