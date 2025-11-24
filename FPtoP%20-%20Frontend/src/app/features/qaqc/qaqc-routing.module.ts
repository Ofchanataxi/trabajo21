import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { HelloComponent } from "./components/atoms/hello/hello.component";
import { ApproveScreenComponent } from "src/app/pages/quality/approve/approve-screen/approve-screen.component";

const routes: Routes = [
  { path: '',
    component: HelloComponent
  },
  {
    path: "approve-pending",
    component: ApproveScreenComponent,
    data: {
      title: "Documentos por revisar",
      showHeader: true,
    },
  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class QaqcRoutingModule {}
