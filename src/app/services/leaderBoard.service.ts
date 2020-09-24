import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import { UserPerformance } from '../model/performance';

@Injectable({
  providedIn: 'root'
})
export class PerformanceService {

  usersURL = 'http://localhost:8080/perf';

  constructor(private http: HttpClient) { }

  getLeaderBoard() {
    return this.http.get<UserPerformance[]>(this.usersURL);
  }
}
