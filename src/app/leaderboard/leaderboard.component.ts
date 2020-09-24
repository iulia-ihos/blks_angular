import { Component, OnInit } from '@angular/core';
import { PerformanceService } from '../services/leaderBoard.service';
import { UserPerformance } from '../model/performance';

@Component({
  selector: 'app-leaderboard',
  templateUrl: './leaderboard.component.html',
  styleUrls: ['./leaderboard.component.css']
})
export class LeaderboardComponent implements OnInit {

  constructor(private leaderBoardService: PerformanceService) { }

  colNames = ["Place", "Username", "Win Percentage"];

  rows : UserPerformance[] = [];

  ngOnInit() {
    this.leaderBoardService.getLeaderBoard().subscribe(
      data => {
        this.rows = data;
      })
  }

}
