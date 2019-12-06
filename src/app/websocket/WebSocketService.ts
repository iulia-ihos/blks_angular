import * as Stomp from 'stompjs';
import * as SockJS from 'sockjs-client';
import { Injectable } from '@angular/core';
import { TokenStorageService } from '../auth/token-storage.service';



@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
    private serverUrl = "http://localhost:8080/stomp-endpoint?token=";
    private stompClient;
    private applicationDestPrefix = "/app";
    private userDestPrefix = "/usr";

    private isConnected = false;

    constructor(private tokenService: TokenStorageService){}

    isWSConnected(): boolean {
      return this.isConnected;
    }

    successCallback(frame) {
      this.isConnected = true;
    }

   initializeWebSocketConnection(token){
     if(this.isConnected)
     return;
      let webSocket = new SockJS(this.serverUrl + token);
      this.stompClient = Stomp.over(webSocket);


      this.stompClient.heartbeat.incoming = 1000;
      this.stompClient.heartbeat.outgoing = 1000;
      
      this.stompClient.connect({}, 
        this.successCallback,
        () => {
          this.isConnected = false;
          console.log("disconected");
         // this.reconnect(this.successCallback)
        });
      setTimeout(()=>{

      }, 1000);
    }

    addSubscription(relativeUrl, callback) {
      if(this.stompClient == undefined) {
        this.initializeWebSocketConnection(this.tokenService.getUsername());
      }
      this.stompClient.subscribe(this.userDestPrefix + relativeUrl, (message) => {
        callback(message.body);
      }
      )
    }

    
    sendMessage(destRaltiveURL: string, message){
      if(this.stompClient == undefined) {
        this.initializeWebSocketConnection(this.tokenService.getUsername());
      }
        var url = this.applicationDestPrefix+destRaltiveURL;
        console.log(this.stompClient);
        this.stompClient.send(url , {}, JSON.stringify(message));
    }

    reconnect(successCallback) {
      let connected = false;
      let reconInv = setInterval(() => {
        var ws = new WebSocket(this.serverUrl);
        this.stompClient = Stomp.over(ws);
        this.stompClient.connect({}, (frame) => {
          clearInterval(reconInv);
          connected = true;
          successCallback();
        }, () => {
          if (connected) {
            this.reconnect(successCallback);
          }
        });
      }, 1000);
    }
}



