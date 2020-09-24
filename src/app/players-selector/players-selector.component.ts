import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { GameService } from '../services/game.service';
import { Game } from '../model/game';
import { Player } from '../model/player';
import { PlayerDetails } from '../model/playerDetails';
import { TileColorEnum } from '../model/TileColorEnum';
import { TokenStorageService } from '../auth/token-storage.service';
import { WebSocketService } from '../websocket/WebSocketService';
import { DataService } from '../services/dataService.service';
import { PlayersMessage } from '../messages/playersMessage';
import { UserService } from '../services/user.service';
import { InviteMessage } from '../messages/inviteMessage';

@Component({
  selector: 'app-players-selector',
  templateUrl: './players-selector.component.html',
  styleUrls: ['./players-selector.component.css']
})
export class PlayersSelectorComponent implements OnInit {

  opponentTypeChosen: boolean;
  computerChosen: boolean;
  humanChosen: boolean;
  redChecked = false;
  yellowChecked = false;
  greenChecked;
  blueChecked;
  choise;
  pentobi;
  ibotnep;
  value;

  redPlayer: PlayerDetails;
  greenPlayer: PlayerDetails;
  yellowPlayer: PlayerDetails;
  bluePlayer: PlayerDetails;

  colorPlayer: Map<TileColorEnum, PlayerDetails>;

  players: Players;

  gameId;

  constructor(private toastr: ToastrService, private gameService: GameService,
    private tokenService: TokenStorageService, private webSocket: WebSocketService,
    private dataService: DataService, private userService: UserService) { }

  ngOnInit() {
    this.webSocket.initializeWebSocketConnection(this.tokenService.getToken());
    this.opponentTypeChosen = false;
    this.computerChosen = false;
    this.humanChosen = false;
    this.value = "pentobi";
    
    this.players = new Players();
    console.log(this.players);
    
  }

  chooseComputer(chooseComputer: boolean) {
    this.opponentTypeChosen = true;
    this.computerChosen = chooseComputer;
    console.log(this.computerChosen);
   }

  startGame() {
    console.log(this.value);
    var colorsChecked = 0;
    if(this.redChecked) colorsChecked++;
    if(this.yellowChecked) colorsChecked++;
    if(this.blueChecked) colorsChecked++;
    if(this.greenChecked) colorsChecked++;

    if(colorsChecked != 2)
       this.toastr.error('You must select 2 colors!');
    else {
      var game = new Game(0, "STARTED");
      if(this.value == "pentobi")
       game.usingPentobi = true;
      else game.usingPentobi = false;
      this.gameService.createGame(game).subscribe( data =>{
        this.gameId = data.idGame;
        var players: Player[] = [];
        if(this.redChecked) 
          players.push(new Player(0, data, new PlayerDetails(0, this.tokenService.getUsername(), TileColorEnum.red, 0)));
        else
           players.push(new Player(0, data, new PlayerDetails(0, this.value, TileColorEnum.red, 0)));
        if(this.yellowChecked) 
           players.push(new Player(0, data, new PlayerDetails(0, this.tokenService.getUsername(), TileColorEnum.yellow, 0)));
        else
           players.push(new Player(0, data, new PlayerDetails(0, this.value, TileColorEnum.yellow, 0)));
        if(this.blueChecked) 
          players.push(new Player(0, data, new PlayerDetails(0, this.tokenService.getUsername(), TileColorEnum.blue, 0)));
        else
          players.push(new Player(0, data, new PlayerDetails(0, this.value, TileColorEnum.blue, 0)));
        if(this.greenChecked) 
          players.push(new Player(0, data, new PlayerDetails(0, this.tokenService.getUsername(), TileColorEnum.green, 0)));
        else
        players.push(new Player(0, data, new PlayerDetails(0, this.value, TileColorEnum.green, 0)));
        this.subscribeToStartMessage();
        this.webSocket.sendMessage("/players", new PlayersMessage(players));
      });
   }
  }

  sendInvite(username: string, color: TileColorEnum) {
    this.startJoinSubscription();
    var player = this.players.getPlayer(color);
    this.userService.checkUsernameExists(username).subscribe( data => {
      if(data) {
         player.notFound = false;
         player.pending = true;
        
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

  readyToStart(){
    this.players.red.setClaimedUsername(this.tokenService.getUsername());
    this.players.blue.setClaimedUsername(this.tokenService.getUsername());
    this.players.yellow.setClaimedUsername(this.tokenService.getUsername());
    this.players.green.setClaimedUsername(this.tokenService.getUsername());

    var game = new Game(0, "PENDING");
    this.gameService.createGame(game).subscribe( data =>{
      this.gameId = data.idGame;
      this.sendPlayersMessage(data);
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

  subscribeToStartMessage() {
    console.log("assdf")
    this.webSocket.addSubscription("/game/start", (data) => {
      var message = JSON.parse(data);
      console.log(message);
      this.dataService.add(this.gameId, message.players);
      window.location.assign("/new-game/" + this.gameId);
    });
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


