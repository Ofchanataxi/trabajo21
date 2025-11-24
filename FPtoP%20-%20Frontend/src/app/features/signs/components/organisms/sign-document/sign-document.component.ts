import { Component, ViewEncapsulation } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { SignerDialogComponent } from "../../molecules/signer-dialog/signer-dialog.component";

@Component({
  selector: "signer-sign-document",
  templateUrl: "./sign-document.component.html",
  styleUrls: ["./sign-document.component.scss"],
  encapsulation: ViewEncapsulation.None,
})
export class SignDocumentComponent {
  constructor(public dialog: MatDialog) {}

  pdfExtension: string = "application/pdf";
  fileToShow: any = null
  fileToSign: any = undefined;
  async onPDFSelected(event: File[]) {
    this.fileToSign = event[0];
    console.log('onPDFSelected');
    console.log(event[0]);
    const fileUrl = await URL.createObjectURL(event[0]);
    this.fileToShow = fileUrl
    console.log(this.fileToShow);
    console.log(this.fileToShow.url);
  }
  ngOnDestroy() {
    if (this.fileToShow) {
      URL.revokeObjectURL(this.fileToShow);
    }
  }

  //  showPreview(file: File, event: MouseEvent) {
  //   event.stopPropagation();
    
  //   // const dialogRef = this.dialog.open(SetStampSignPdfComponent, {
  //   //   width: "80%",
  //   //   height: "80%",
  //   //   data: { url: fileUrl, title: file.name },
  //   // });
  //   // dialogRef.afterClosed().subscribe((result) => {});
  // }

  openDialog() {
    console.log("Entre a openDialog");
    const dialogRef = this.dialog.open(SignerDialogComponent, {
      width: "100%",
      height: "100%",
      maxWidth: "none",
      data: {
      fileToSign: this.fileToSign, // Pasa el archivo para firmar
      fileToShow: this.fileToShow, // Pasa el archivo para mostrar
    },
      panelClass: "custom-modalbox",
    });

    dialogRef.componentInstance.dialogClosed.subscribe((result: boolean) => {
      if (result) {
        this.dialog.closeAll();
      }
    });
  }
}
