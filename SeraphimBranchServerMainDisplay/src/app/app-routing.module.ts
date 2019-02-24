import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { GameScreenComponent } from "./game-screen/game-screen.component";

const routes: Routes = [
  { path: "gamescreen/:name", component: GameScreenComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
