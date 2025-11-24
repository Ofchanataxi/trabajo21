import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SignsRoutingModule } from './signs-routing.module';
import { SignDocumentComponent } from './components/organisms/sign-document/sign-document.component';
import { SignDocumentPageTestComponent } from './components/pages/sign-document-page-test/sign-document-page-test.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { SignsHomePageComponent } from './pages/signs-home-page/signs-home-page.component';
//import { SignerDialogComponent } from './components/molecules/signer-dialog/signer-dialog.component';
import { SignerCertificateComponent } from './components/molecules/signer-certificate/signer-certificate.component';
import { SLBModule } from 'src/app/core/modules/slb.module';
import { MaterialModule } from 'src/app/core/modules/material.module';

import { AppModule } from 'src/app/app.module';

@NgModule({
  declarations: [],
  imports: [CommonModule, SignsRoutingModule, SharedModule, SLBModule, MaterialModule],
  exports: [
    //SignDocumentPageTestComponent, // Exporta este componente
  ],
})
export class SignsModule {}
