import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Game } from '../model/game';

@Injectable({
  providedIn: 'root'
})
export class GameService {

  gameURL = 'http://localhost:8080/game';

  constructor(private http: HttpClient) { }

  getGameById(id: number) {
    return this.http.get<Game>(this.gameURL + '/' + id);
  }

  createGame(game: Game) {
    return this.http.post<Game>(this.gameURL, game);
  }

  updateGame(game: Game) {
    return this.http.put<Game>(this.gameURL, game);
  }
}
