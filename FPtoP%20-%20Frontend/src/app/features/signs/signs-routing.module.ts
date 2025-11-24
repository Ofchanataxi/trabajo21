import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { SignDocumentPageTestComponent } from "./components/pages/sign-document-page-test/sign-document-page-test.component";

const routes: Routes = [
  {
    path: "signer",
    component: SignDocumentPageTestComponent,
    data: {
      title: "Firmar",
      showHeader: true,
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SignsRoutingModule {}
