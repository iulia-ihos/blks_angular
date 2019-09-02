import * as Stomp from 'stompjs';
import * as SockJS from 'sockjs-client';
import { Injectable } from '@angular/core';
import { TokenStorageService } from '../auth/token-storage.service';
// import { RxStompService } from '@stomp/ng2-stompjs';


@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
    private serverUrl = "http://localhost:8080/stomp-endpoint?token=" + this.tokenService.getToken();
    private stompClient;

    isConnected = false;

    constructor(private tokenService: TokenStorageService){
                //   this.rxStompService.watch('/topic/demo').subscribe((message) => {
                //    console.log(message);
                //   });
    }

    // send() {
    //   const message = JSON.stringify({to:"you", from:"me"});
    //   this.rxStompService.publish({destination: '/topic/demo', body: message});
    // }

    

    initializeWebSocketConnection(){
        let webSocket = new SockJS(this.serverUrl);
        this.stompClient = Stomp.over(webSocket);
        this.stompClient.heartbeat.incoming = 1000;
        this.stompClient.heartbeat.outgoing = 1000;
       // let that = this;
        
        this.stompClient.connect({}, (frame) => {
          console.log(frame);
          console.log(this);
          //this.sendMessage();

          this.stompClient.subscribe("/game/move", (message) => {
            if(message.body) {
              console.log(message.body);
            }
          });

          this.sendMessage({text:"you", from:"me"});

        });
      }
    
    connectionSuccessCallback(frame) {
        console.log(frame);
        console.log(this);
        //this.sendMessage();
      
        this.stompClient.subscribe("/game/move", (message) => {
          if(message.body) {
            console.log(message.body);
          }
        });

        this.stompClient.send("/app/game" , {}, {to:"you", from:"me"});
    }
    
    sendMessage(message){
      console.log("send");
        console.log(this.stompClient);
        this.stompClient.send("/app/game" , {}, JSON.stringify(message));
    }
}



