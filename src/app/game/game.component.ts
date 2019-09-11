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
import { DataService } from '../service/dataService';
import { PlayerDetails } from '../model/playerDetails';
import { Game } from '../model/game';
import { MoveMessage } from '../messages/moveMessage';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit {

  gameSetUp: boolean = true;
  players: Players;

  currentPlayerColor: TileColorEnum;
  game: Game;
  currentPlayer: PlayerDetails;

  gameId: number;
  joinSubscriptionStarted: boolean;

  redPlayer: PlayerDetails;
  greenPlayer: PlayerDetails;
  yellowPlayer: PlayerDetails;
  bluePlayer: PlayerDetails;

  colorPlayer: Map<TileColorEnum, PlayerDetails>;


  constructor(private tokenService: TokenStorageService,
        private userService: UserService,
        private webSocket: WebSocketService, 
        private gameService: GameService,
        private route: ActivatedRoute, private dataService: DataService) { }

  ngOnInit() {
    this.webSocket.initializeWebSocketConnection(this.tokenService.getToken());
    this.colorPlayer = new Map<TileColorEnum, PlayerDetails>();
    this.colorPlayer.set(TileColorEnum.red, this.redPlayer);
    this.colorPlayer.set(TileColorEnum.blue, this.bluePlayer);
    this.colorPlayer.set(TileColorEnum.green, this.greenPlayer);
    this.colorPlayer.set(TileColorEnum.yellow, this.yellowPlayer);
    this.joinSubscriptionStarted = false;
    this.players = new Players();
    
    this.gameSetUp = false;

    this.route.params.subscribe(params =>   {
        this.gameId = params.id;
        this.gameService.getGameById(this.gameId).subscribe(game => {
          this.game = game;
          console.log(this.game);
        });
        var players =  this.dataService.getPlayers(this.gameId);
        if(players == undefined) {
          this.gameSetUp = false; 
      } else {
        setTimeout(() =>{
          this.subscribeToMoveMessage();
        }, 1000);
        this.setPlayers(players);
        this.gameSetUp = true;
      }
    });
      
 
    

  }

  sendInvite(username: string, color: TileColorEnum) {
    var player = this.players.getPlayer(color);
    this.userService.checkUsernameExists(username).subscribe( data => {
      if(data) {
         player.notFound = false;
         player.pending = true;
        if(!this.joinSubscriptionStarted) this.startJoinSubscription();
        this.webSocket.sendMessage("/invite", 
          new InviteMessage(username, this.tokenService.getUsername(), color, this.gameId));
      }
      else {
        player.notFound = true;
      }
    });
  }

  startJoinSubscription() {
    this.webSocket.addSubscription("/game/join", (data) => {
      var message = JSON.parse(data);
      var player = this.players.getPlayer(message.color);
      player.joined = true;
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
      //this.colorPlayer.get(this.currentPlayer.color).points = this.currentPlayer.points;
      this.getPlayer(message.currentPlayer.color).points = message.currentPlayer.points;
      this.currentPlayerColor = message.nextPlayer.color;
      this.currentPlayer = message.nextPlayer; 
    });
  }

  setSideMenuPlayer(color, PlayerDetails) {

  }

  readyToStart(){
    this.players.red.setClaimedUsername(this.tokenService.getUsername());
    this.players.blue.setClaimedUsername(this.tokenService.getUsername());
    this.players.yellow.setClaimedUsername(this.tokenService.getUsername());
    this.players.green.setClaimedUsername(this.tokenService.getUsername());

    this.gameService.getGameById(this.gameId).subscribe( game => {
      this.sendPlayersMessage(game);
      this.currentPlayerColor = TileColorEnum.red;
      this.subscribeToMoveMessage();
    });
  }

  sendPlayersMessage(game){
    var redPlayer = new Player(0, game, new PlayerDetails(0, this.players.red.username, TileColorEnum.red, 0));
    var greenPlayer = new Player(0, game, new PlayerDetails(0, this.players.green.username, TileColorEnum.green, 0));
    var bluePlayer = new Player(0, game, new PlayerDetails(0, this.players.blue.username, TileColorEnum.blue, 0));
    var yellowPlayer = new Player(0, game, new PlayerDetails(0, this.players.yellow.username, TileColorEnum.yellow, 0));
    var players = new PlayersMessage([redPlayer, greenPlayer, bluePlayer, yellowPlayer]);
    this.subscribeToStartMessage();

    this.webSocket.sendMessage("/players", players);
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

  subscribeToStartMessage() {
    
    this.webSocket.addSubscription("/game/start", (data) => {
      this.gameSetUp = true;
      var message = JSON.parse(data);
     this.setPlayers(message.players);
    });
  }

}

class PlayerSetUp {
  username: string;
  joined: boolean;
  pending: boolean;
  invited: boolean;
  notFound: boolean;
  claimed: boolean;

  constructor() {
    this.joined = false;
    this.pending = false;
    this.invited = false;
    this.notFound = false;
    this.claimed = false;
  }

  setClaimedUsername(username) {
    if(this.claimed) 
    this.username = username;
  }
}

class Players {
  
  red: PlayerSetUp;
  green: PlayerSetUp;
  blue: PlayerSetUp;
  yellow: PlayerSetUp;

  constructor() {
    this.red = new PlayerSetUp();
    this.green = new PlayerSetUp();
    this.blue = new PlayerSetUp();
    this.yellow = new PlayerSetUp();
  }

  getPlayer(color: TileColorEnum) {
    switch(color) {
      case "red" :
        return this.red;
      case "blue" :
        return this.blue;
      case "green" :
        return this.green;
      case "yellow" :
        return this.yellow;
    }
  }

 
}

