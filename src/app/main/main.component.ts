import { Component, OnInit } from '@angular/core';
import { TokenStorageService } from '../auth/token-storage.service';
import { WebSocketService } from '../websocket/WebSocketService';
import { TileColorEnum } from '../model/TileColorEnum';
import { JoinMessage } from '../messages/joinMessage';
import { GameService } from '../services/game.service';
import { Game } from '../model/game';
import { DataService } from '../services/dataService.service';
import { PlayersMessage } from '../messages/playersMessage';



@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {

  private notifs: GameNotification[];
  private joined: GameNotification[];
  private hasJoined: boolean;
  private joinedAlert: string; 
  private showCantJoinAlert: boolean;

  constructor(private tokenService: TokenStorageService,
            private webSocket: WebSocketService, 
           private gameService: GameService, 
           private dataService: DataService) { }

  ngOnInit() {
    this.notifs = [];
    this.joined = [];
    this.hasJoined = false;
    this.joinedAlert = "You'll be redirected as soon as the game starts";
    this.webSocket.initializeWebSocketConnection(this.tokenService.getToken());
    this.showCantJoinAlert = false;
     
    setTimeout(() => {
      this.webSocket.addSubscription("/game/invite", (m) => {
        var message = JSON.parse(m);
        
        console.log("invite");
         console.log(message);
        if(message.username == this.tokenService.getUsername() && message.from != this.tokenService.getUsername()) {
          this.notifs.push(new GameNotification(message.from + " invited you to play!", message.from, 
                              message.idGame, message.color));
        }
      });
    }, 1000);
   
  }


  join(i: number) {
    console.log(" joining.....");
    if(this.hasJoined) {
      if(this.joined.length>0 && this.notifs[i].gameId != this.joined[0].gameId )
        this.showCantJoinAlert = true;
      
   }
   if(this.hasJoined == false || (this.joined.length>0 && this.notifs[i].gameId == this.joined[0].gameId )) {
    this.addSubcriptionPlayers();
      this.webSocket.sendMessage("/join", new JoinMessage(this.notifs[i].gameId, this.tokenService.getUsername(),
                this.notifs[i].color, this.notifs[i].sender));
      this.joined.push(this.notifs[i]);
      this.notifs.splice(i,1);
      this.hasJoined = true;
   }
    
    
  }

  addSubcriptionPlayers() {
    this.webSocket.addSubscription("/game/start", (data) => {
      var message: PlayersMessage = JSON.parse(data);
      var idGame = message.players[0].game.idGame;
      this.dataService.add(idGame, message.players);
     window.location.assign("new-game/"+idGame);

    });
  }

  

  startGame() {
    this.gameService.createGame(new Game(0, "PENDING")).subscribe( data =>{
      //window.location.assign("/new-game/"+data.idGame);
      window.location.assign("/players");
    });
  }

  logOut() {
    this.tokenService.signOut();
  }

}

export class GameNotification {
  message: string;
  sender: string;
  gameId: number;
  color: TileColorEnum;

  constructor(message: string, sender: string, gameId: number, color) {
    this.message = message;
    this.gameId = gameId;
    this.sender = sender;
    this.color = color;
  }
}