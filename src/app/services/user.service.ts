import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {User} from '../model/user';
import { UserPerformance } from '../model/performance';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  usersURL = 'http://localhost:8080/user';

  constructor(private http: HttpClient) { }

  getUserByEmail(email: string) {
    return this.http.get<User>(this.usersURL + '/getByEmail/' + email);
  }

  getPerformance() {
    return this.http.get<UserPerformance>(this.usersURL+"/score");
  }
}
