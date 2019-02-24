import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { BehaviorSubject } from "rxjs";
import { ConfigService } from "./config.service";

@Injectable({
  providedIn: "root"
})
export class RootServerService {
  public api = `http://192.168.0.180:4300`;
  public branchApi = `http://192.168.0.180:4400`;
  public scriptInstances: any;
  public selectedScript: any;
  public selectedScriptInstance: any;
  public observableScript: any;

  constructor(private http: HttpClient, public config: ConfigService) {
    this.observableScript = new BehaviorSubject<any>(this.selectedScript);
    this.api = config.getApiUrl();
    this.branchApi = config.getBranchApi();
  }

  public loadScript(name): Observable<any> {
    this.http.get(`${this.api}/game/${name}`).subscribe(scriptInstance => {
      this.selectedScriptInstance = scriptInstance;
      console.log(scriptInstance);
    });
    return this.http.get(`${this.api}/script/${name}`);
  }

  public pauseInstanceTimer(instanceName: any): Observable<any> {
    return this.http.get(`${this.api}/game/time/pause/${instanceName}`);
  }

  public resumeInstanceTimer(instanceName: any): Observable<any> {
    return this.http.get(`${this.api}/game/time/resume/${instanceName}`);
  }
}
