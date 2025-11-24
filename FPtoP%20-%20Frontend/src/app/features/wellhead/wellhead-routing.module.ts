import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { WellheadHomePageComponent } from "./pages/wellhead-home-page/wellhead-home-page.component";
import { WellheadActiveWellsPageComponent } from "./pages/wellhead-active-wells-page/wellhead-active-wells-page.component";

const routes: Routes = [
  {
  path: "home",
  component: WellheadHomePageComponent,
  },
  {
    path: "active-wells",
    component: WellheadActiveWellsPageComponent,
  },
  {
    path: "**",
    redirectTo: 'home',
  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class WellheadRoutingModule {}
