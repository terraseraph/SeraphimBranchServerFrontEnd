import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root"
})
export class ConfigService {
  public api = `http://localhost:4300`;
  // public api = `${location.protocol}//${location.host}`;

  public screenConfig = {
    configs: [
      {
        name: "Christmas",
        style: {
          "font-family": `"Comic Sans MS", cursive, sans-serif`,
          color: "#f1f1f1"
        }
      }
    ]
  };
  constructor() {}

  public getApiUrl() {
    console.log(this.api);
    return this.api;
  }
}
