import { Injectable } from "@angular/core";
import * as io from "socket.io-client";
import { Observable, of } from "rxjs";
import { ConfigService } from "./config.service";
import { DataManagerService } from "./data-manager.service";

@Injectable({
  providedIn: "root"
})
export class SocketsService {
  private url = "192.168.0.180:4300"; //Also loads from config
  private socket: any;
  private currentScript: any;

  constructor(public config: ConfigService) {
    this.socket = io(this.url);
    this.url = this.config.getApiUrl();
  }

  getMessages() {
    return Observable.create(observer => {
      this.socket.on("message", message => {
        observer.next(message);
      });
    });
  }
}
