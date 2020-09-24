import { Injectable } from '@angular/core';
import { Player } from '../model/player';
import { Observable, BehaviorSubject } from 'rxjs';
import { TileColorEnum } from '../model/TileColorEnum';
import { HintMessage } from '../messages/hintMessage';

@Injectable({
    providedIn: 'root'
  })
export class DataService {


    constructor() {
    }

    add(idGame: number, players: Player[]){
      window.sessionStorage.setItem("game"+idGame, JSON.stringify(players));
    }

   getPlayers(idGame:number) {
    return JSON.parse(sessionStorage.getItem("game"+idGame));
     }

   addHint(hint: HintMessage){
      window.sessionStorage.setItem("game"+hint.idGame + hint.color, JSON.stringify(hint));
    }

   getHint(idGame:number, color: TileColorEnum) {
    return JSON.parse(sessionStorage.getItem("game"+idGame + color));
     }

}
