import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import { HttpClientModule } from "@angular/common/http";

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { GameScreenComponent } from "./game-screen/game-screen.component";
import { RootServerService } from "./root-server.service";

@NgModule({
  declarations: [AppComponent, GameScreenComponent],
  imports: [BrowserModule, AppRoutingModule, HttpClientModule],
  providers: [RootServerService],
  bootstrap: [AppComponent]
})
export class AppModule {}
