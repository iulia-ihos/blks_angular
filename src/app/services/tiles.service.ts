import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {User} from '../model/user';
import { UserPerformance } from '../model/performance';
import { Tile } from '../model/tile';

@Injectable({
  providedIn: 'root'
})
export class TilesService {

  tilesURL = 'http://localhost:8080/tiles';

  constructor(private http: HttpClient) { }

  getAll() {
    return this.http.get<Tile[]>(this.tilesURL);
  }


}
