import { Component, ViewEncapsulation } from "@angular/core";

@Component({
  selector: "app-upload-sign-files",
  templateUrl: "./upload-sign-files.component.html",
  styleUrls: ["./upload-sign-files.component.scss"],
  encapsulation: ViewEncapsulation.None
})
export class UploadSignFilesComponent {
  fileExample: File = new File(
    [
      new Blob(["Este es el contenido del archivo."], {
        type: "application/pdf",
      }),
    ],
    "file.pdf",
    {
      type: "application/pdf",
      lastModified: new Date().getTime(),
    }
  );
}
