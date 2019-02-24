import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root"
})
export class ConfigService {
  public api = `http://192.168.0.180:4300`;
  public branchApi = `http://192.168.0.180:4400`;

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
    return this.api;
  }

  public getBranchApi() {
    return this.branchApi;
  }
}
