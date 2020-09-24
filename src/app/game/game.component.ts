import { Component, OnInit } from '@angular/core';
import { TokenStorageService } from '../auth/token-storage.service';
import { UserService } from '../services/user.service';
import { TileColorEnum } from '../model/TileColorEnum';
import { InviteMessage } from '../messages/inviteMessage';
import { WebSocketService } from '../websocket/WebSocketService';
import { GameService } from '../services/game.service';
import { PlayersMessage } from '../messages/playersMessage';
import { Player } from '../model/player';
import { ActivatedRoute } from '@angular/router';
import { DataService } from '../services/dataService.service';
import { PlayerDetails } from '../model/playerDetails';
import { Game } from '../model/game';
import { MoveMessage } from '../messages/moveMessage';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit {

  gameSetUp: boolean = false;

  currentPlayerColor: TileColorEnum;
  game: Game;
  currentPlayer: PlayerDetails;
  nextMove: MoveMessage;

  gameId: number;

  max_score;

  redPlayer: PlayerDetails;
  greenPlayer: PlayerDetails;
  yellowPlayer: PlayerDetails;
  bluePlayer: PlayerDetails;

  colorPlayer: Map<TileColorEnum, PlayerDetails>;


  constructor(private tokenService: TokenStorageService,
        private userService: UserService,
        private webSocket: WebSocketService, 
        private gameService: GameService,
        private route: ActivatedRoute, private dataService: DataService,
        private toastr: ToastrService) { }

  ngOnInit() {
    this.webSocket.initializeWebSocketConnection(this.tokenService.getToken());
    this.subscribeToMoveMessage();
    this.colorPlayer = new Map<TileColorEnum, PlayerDetails>();
    this.colorPlayer.set(TileColorEnum.red, this.redPlayer);
    this.colorPlayer.set(TileColorEnum.blue, this.bluePlayer);
    this.colorPlayer.set(TileColorEnum.green, this.greenPlayer);
    this.colorPlayer.set(TileColorEnum.yellow, this.yellowPlayer);
  
    this.currentPlayerColor = TileColorEnum.red;

    this.route.params.subscribe(params =>   {
     
      this.gameSetUp = true;
        this.gameId = params.id;
        this.gameService.getGameById(this.gameId).subscribe(game => {
          this.game = game;
          console.log(this.game);
          var players =  this.dataService.getPlayers(this.gameId);
          
              console.log(players);
              if(players == undefined) {
                this.gameSetUp = false;
            } else {
              this.gameSetUp = true;
              this.setPlayers(players);
              this.currentPlayer = this.redPlayer;       
      }
        });
        
        
    });
      
  }

  

  getPlayer(color: TileColorEnum) {
    switch(color) {
      case "red" :
        return this.redPlayer;
      case "blue" :
        return this.bluePlayer;
      case "green" :
        return this.greenPlayer;
      case "yellow" :
        return this.yellowPlayer;
    }
  }

 

  subscribeToMoveMessage() {
    this.webSocket.addSubscription("/game/move", (data) => {
      var message: MoveMessage = JSON.parse(data);
      this.nextMove = message;
      //this.colorPlayer.get(this.currentPlayer.color).points = this.currentPlayer.points;
      this.getPlayer(message.currentPlayer.color).points = message.currentPlayer.points;
      this.currentPlayerColor = message.nextPlayer.color;
      this.currentPlayer = message.nextPlayer; 
      if(this.currentPlayerColor == null) {
        this.toastr.success("Game over");
        var max = 0;

        if(this.redPlayer.points > max)
          max = this.redPlayer.points;
        if(this.bluePlayer.points > max)
        max = this.bluePlayer.points;
        if(this.greenPlayer.points > max)
        max = this.greenPlayer.points;
        if(this.yellowPlayer.points > max)
        max = this.yellowPlayer.points;
        this.max_score = max;
      }
    
    });
  }


   setPlayers(players: Player[]) {   
    players.forEach(player => {
      switch(player.playerDetails.color) {
        case "red":
          this.redPlayer = player.playerDetails;
          break;
        case "blue":
          this.bluePlayer = player.playerDetails;
          break;
        case "green":
          this.greenPlayer = player.playerDetails;
          break;
        case "yellow":
          this.yellowPlayer = player.playerDetails;
          break;
      }
    })
    this.currentPlayer = this.redPlayer;
    this.currentPlayerColor = TileColorEnum.red;
   
  }

requestHint(color) {
  console.log(color);
  var hint = this.dataService.getHint(this.gameId, color);
  this.toastr.info("The tile to use: " + hint.tileName);
}

}



