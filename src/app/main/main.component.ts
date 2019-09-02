import { Component, OnInit } from '@angular/core';
import { TokenStorageService } from '../auth/token-storage.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {

  constructor(private tokenService: TokenStorageService) { }

  ngOnInit() {
  }

  logOut() {
    this.tokenService.signOut();
  }

}
