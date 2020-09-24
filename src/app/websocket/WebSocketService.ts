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


    successCallback() {
      console.log("is connected");
      this.isConnected = true;
    }

    errorCallback(error) {
      console.log("error callback", "here");
      console.log('STOMP: ' + error);
     // this.initializeWebSocketConnection(this.token);
  }

   initializeWebSocketConnection(token){
      if(this.isConnected)
        return;
      let webSocket = new SockJS(this.serverUrl + token);
      this.stompClient = Stomp.over(webSocket);

      this.stompClient.heartbeat.incoming = 1000;
      this.stompClient.heartbeat.outgoing = 1000;
      
      //connect is an asynchronous call
      this.stompClient.connect({}, 
        this.successCallback,
        this.errorCallback
       );
    }

    addSubscription(relativeUrl, callback) {
      console.log("want to subscribe", this.isConnected);
      if(!this.isConnected) {
        setTimeout(()=>{
          
          this.stompClient.subscribe(this.userDestPrefix + relativeUrl, (message) => {
            console.log(message);
            callback(message.body);
          }
          )
        }, 3000);
      } 
      else {
        this.stompClient.subscribe(this.userDestPrefix + relativeUrl, (message) => {
          console.log(message);
          callback(message.body);
        })
      }
        
    }

    
    sendMessage(destRelativeURL: string, message){
      console.log("connected?", this.isConnected);
      var url = this.applicationDestPrefix+destRelativeURL;
      if(!this.isConnected) {
        setTimeout(()=>{
          this.stompClient.send(url , {}, JSON.stringify(message));
        }, 3000);
      }
      else {
        this.stompClient.send(url , {}, JSON.stringify(message));
      }
         
    
       
    }

}



