import { Injectable } from '@angular/core';
import { Player } from '../model/player';
import { Observable, BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root'
  })
export class DataService {

     gamePlayers:  BehaviorSubject<Map<number, Player[]>> = new BehaviorSubject<Map<number, Player[]>>(new Map<number, Player[]>());
     players: BehaviorSubject<Player[]> = new BehaviorSubject<Player[]>([]);



    constructor() {
    }


    add(idGame: number, players: Player[]){
      window.sessionStorage.setItem("game"+idGame, JSON.stringify(players));
       
     
     
    }

   getPlayers(idGame:number) {
    return JSON.parse(sessionStorage.getItem("game"+idGame));
     }


}
