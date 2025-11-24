interface SignDocumentInformation {
  file?: File;
  certificate: {
    file: File | undefined;
    password: string;
  };
  sign: {
    reason: String;
    location: String;
    stamp: {
      type: String;
      page: number;
      xPos: number;
      ypos: number;
    };
  };
}

import {
  Component,
  EventEmitter,
  Inject,
  Output,
  ViewEncapsulation,
  ViewChild,
  Input,
} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { RadioButtonValue } from '@slb-dls/angular-material/radio-button-group';
import { PdfViewerDialogComponent } from 'src/app/organisms/pdf-viewer-dialog/pdf-viewer-dialog.component';
import { PDFDocument } from 'pdf-lib';
import { OnInit } from '@angular/core';
import { SigningService } from 'src/app/services/signing.service';
import { FormControl, FormGroup } from '@angular/forms';
import { MatSelectChange } from '@angular/material/select';

@Component({
  selector: 'sign-signer-dialog',
  templateUrl: './signer-dialog.component.html',
  styleUrls: ['./signer-dialog.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class SignerDialogComponent {
  @Input() fileToSign: File;
  @Input() fileToShow: any;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<SignerDialogComponent>,
    public dialog: MatDialog,
    private signingService: SigningService
  ) {
    // Asigna los datos recibidos al abrir el diálogo
    this.fileToSign = data.fileToSign;
    this.fileToShow = data.fileToShow;
    this.goToLastPage();
  }

  @Output() dialogClosed = new EventEmitter<boolean>();
  signDocumentInformation: SignDocumentInformation = {
    certificate: {
      file: undefined,
      password: '',
    },
    sign: {
      stamp: {
        page: 1,
        type: 'qr',
        xPos: 0,
        ypos: 0,
      },
      location: '',
      reason: '',
    },
  };

  updateCertificate(certificate: File) {
    this.signDocumentInformation.certificate.file = certificate;
  }

  updatePasswordCertificate(password: string) {
    this.signDocumentInformation.certificate.password = password;
  }

  formulario: FormGroup = new FormGroup({
    conditionID: new FormControl(1),
  });

  get conditionIDControl(): FormControl {
    return (this.formulario.get('conditionID') as FormControl) || new FormControl('');
  }

  onChange(event: MatSelectChange) {
    this.conditionIDControl.setValue(event.value); // Actualiza el FormControl
    //this.selectionChange.emit(event.value); // Notifica al padre
  }

  numberPages: { key: number; value: string }[] = [];

  idConditionSelected: number = 1;

  async selectionChangeEvent(idCondition: any): Promise<void> {
    console.log('Se envia');
    console.log(idCondition);
    this.actualPDFPage = idCondition;
    const details = await this.processPdf();

    console.log(details);
    this.detailsPage = details.pageSizes[this.actualPDFPage - 1];

    console.log('this.detailsPage');
    console.log(this.detailsPage);

    this.signDocumentInformation.sign.stamp.page = this.actualPDFPage;

    const element = document.getElementById('pdfViewerContainerData');

    console.log('element');
    console.log(element);
    if (element !== null) {
      const rect = element.getBoundingClientRect();
      console.log('Rect:', rect);

      let heightPixel;
      if (this.detailsPage.rotation === 0) {
        heightPixel = this.obtainHeightPixel(
          rect.width,
          this.detailsPage.width,
          this.detailsPage.height
        );
      } else {
        heightPixel = this.obtainHeightPixel(
          rect.width,
          this.detailsPage.height,
          this.detailsPage.width
        );
      }

      console.log('heightPixel:', heightPixel);
      this.heightPage = heightPixel + 'px';
    }
  }
  // stampOptions: RadioButtonValue[] = [
  //   {
  //     value: "qr",
  //     name: "QR",
  //     isDefault: true,
  //     isDisabled: false,
  //   },
  //   {
  //     value: "full",
  //     name: "Completo",
  //     isDefault: false,
  //     isDisabled: false,
  //   },
  //   {
  //     value: "simple",
  //     name: "simple",
  //     isDefault: false,
  //     isDisabled: false,
  //   },
  //   {
  //     value: "invisible",
  //     name: "Invisible",
  //     isDefault: false,
  //     isDisabled: false,
  //   },
  // ];
  isSigning: boolean = false;

  selectedFile: File | null = null;

  hidePassword: boolean = true;
  certificatePassword: string = '';

  closeDialogFromInside(): void {
    this.dialogRef.close();
    this.dialogClosed.emit(true);
  }

  downloadFile(file: File) {
    const fileUrl = URL.createObjectURL(file);
    const a = document.createElement('a');
    a.href = fileUrl;
    a.download = file.name;
    a.click();
    URL.revokeObjectURL(fileUrl);
  }

  // onSelectedStamp(event: any) {
  //   this.signDocumentInformation.sign!.stamp.type = event.value;
  // }

  signUbication: { x: number; y: number; width: number; height: number } | undefined = undefined;
  currentPage = 1;
  pageSizes: { page: number; width: number; height: number }[] = [];

  pdfPageDimensions: { width: number; height: number } = {
    width: 0,
    height: 0,
  };

  @ViewChild('pdfViewerVar') pdfViewerVar: any;

  @ViewChild('pdfContainer', { static: true }) pdfContainer!: any;

  ngOnInit() {
    this.setupClickListener();
    this.goToLastPage();
  }

  setupClickListener() {
    const container = this.pdfContainer.nativeElement;

    container.addEventListener('click', (event: MouseEvent) => {
      const rect = container.getBoundingClientRect();

      // Coordenadas relativas al contenedor
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      console.log(`Coordinates: X=${x}, Y=${y}`);
    });
  }

  async getPdfPageDetails(): Promise<any> {
    // Convertir el archivo a un ArrayBuffer

    //const arrayBuffer = await file.arrayBuffer();
    if (this.fileToSign) {
      console.log('this.fileToSign');
      console.log(this.fileToSign);
      const arrayBuffer = await this.fileToSign.arrayBuffer();

      const pdfDoc = await PDFDocument.load(arrayBuffer);

      const totalPages = pdfDoc.getPageCount();
      const pageSizes = pdfDoc.getPages().map(page => ({
        width: page.getWidth(),
        height: page.getHeight(),
        rotation: page.getRotation().angle,
        page: page,
      }));

      console.log('Total Pages:', totalPages);
      console.log('Page Sizes:', pageSizes);
      return { totalPages, pageSizes };
    }

    // const totalPages = pdf.numPages;
    // const pageSizes: { width: number, height: number }[] = [];

    // // Obtener tamaños de cada hoja
    // for (let i = 1; i <= totalPages; i++) {
    //   const page = await pdf.getPage(i);
    //   const viewport = page.getViewport({ scale: 1 });
    //   pageSizes.push({ width: viewport.width, height: viewport.height });
    // }

    //return true;
  }

  async processPdf() {
    try {
      const details = await this.getPdfPageDetails();
      console.log('Total Pages:', details.totalPages);
      console.log('Page Sizes:', details.pageSizes);
      return details;
    } catch (error) {
      console.error('Error processing PDF:', error);
    }
  }

  actualPDFPage = 1;
  heightPage = '3500px';
  detailsPage: any;
  obtainHeightPixel(width: number, widthPage: number, heightPage: number) {
    const heightPixel = (heightPage * width) / widthPage;
    return heightPixel;
  }
  async goToLastPage() {
    console.log('this.actualPDFPage');
    console.log(this.actualPDFPage);
    const details = await this.processPdf();
    console.log('details');
    console.log(details);

    let arrTempOptions: any = [];

    for (let i = 1; i < details.totalPages; i++) {
      let objTemp = {
        key: i,
        value: i.toString(),
      };
      arrTempOptions = [...arrTempOptions, objTemp];
    }
    this.numberPages = arrTempOptions;
    this.actualPDFPage = details.totalPages;
    this.detailsPage = details.pageSizes[this.actualPDFPage - 1];

    this.signDocumentInformation.sign.stamp.page = this.actualPDFPage;

    const element = document.getElementById('pdfViewerContainerData');

    console.log('element');
    console.log(element);
    if (element !== null) {
      const rect = element.getBoundingClientRect();
      console.log('Rect:', rect);

      const heightPixel = this.obtainHeightPixel(
        rect.width,
        this.detailsPage.width,
        this.detailsPage.height
      );
      console.log('heightPixel:', heightPixel);
      this.heightPage = heightPixel + 'px';
    }
  }

  sendData() {
    console.log('this.signDocumentInformation');
    console.log(this.signDocumentInformation);

    const file = this.signDocumentInformation.file;
    const certificateFile = this.signDocumentInformation.certificate.file;
    const certificatePassword = this.signDocumentInformation.certificate.password;

    const signData = {
      reason: 'Firmador de prueba',
      location: 'Quito, Ecuador',
      stamp: {
        type: 'qr',
        page: this.signDocumentInformation.sign.stamp.page,
        xPos: this.signDocumentInformation.sign.stamp.xPos,
        yPos: this.signDocumentInformation.sign.stamp.ypos,
      },
    };

    if (file && certificateFile) {
      this.isSigning = true;
      this.signingService
        .signPdf(file, certificateFile, certificatePassword, JSON.stringify(signData))
        .subscribe({
          next: (response: Blob) => {
            // Crear una URL para el archivo devuelto
            const url = window.URL.createObjectURL(response);

            // Crear un enlace para descargar el archivo
            const a = document.createElement('a');
            a.href = url;
            a.download = 'signed-document.pdf'; // Nombre del archivo
            a.click();

            // Liberar memoria al eliminar el objeto Blob
            window.URL.revokeObjectURL(url);

            console.log('PDF descargado con éxito.');
            this.closeDialogFromInside();
            this.isSigning = false;
          },
          error: err => {
            console.error('Error al firmar el PDF:', err);
            this.isSigning = false;
          },
        });
    }
  }

  async onPdfClick(event: MouseEvent) {
    const pdfContainer = event.currentTarget as HTMLElement;
    console.log('pdfContainer');
    console.log(pdfContainer);
    const rect = pdfContainer.getBoundingClientRect();
    // Coordenadas del clic dentro del PDF en PÍXELES, relativas al visor
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
 
    // dimensiones de la pagina del PDF en PUNTOS
    const pageOriginalWidth_points = this.detailsPage.width;
    const pageOriginalHeight_points = this.detailsPage.height;
    const pageRotation = this.detailsPage.rotation;
 
    // dimensiones de la pagina RENDERIZADA en el visor en PÍXELES
    const pageRenderedWidth_pixels = rect.width;
    const pageRenderedHeight_pixels = rect.height;
   
    // dimensiones del rectángulo de firma final
    const SIGNATURE_WIDTH_POINTS = 116;
    const SIGNATURE_HEIGHT_POINTS = 39;
 
    let finalX_points = 0;
    let finalY_points = 0;

    // Transformar las coordenadas del clic a PUNTOS
    if (pageRotation === 0) {
      // X del píxel a punto
      finalX_points = (x * pageOriginalWidth_points) / pageRenderedWidth_pixels;
      // escala Y, e invierte el eje
      const y_scaled = (y * pageOriginalHeight_points) / pageRenderedHeight_pixels;
      finalY_points = pageOriginalHeight_points - y_scaled;
    } else if (pageRotation === 90) {
      // X del clic corresponde al eje Y del PDF
      finalY_points = (x * pageOriginalHeight_points) / pageRenderedWidth_pixels;
      // Y del clic corresponde al eje X del PDF
      finalX_points = (y * pageOriginalWidth_points) / pageRenderedHeight_pixels;
    }

    // ajustar la posicion para que el clic sea la esquina izquierda inferior.
    if (pageRotation === 90) {
        finalX_points = finalX_points - SIGNATURE_HEIGHT_POINTS;
    }

    // Evitar coordenadas negativas
    finalX_points = Math.max(0, finalX_points);
    finalY_points = Math.max(0, finalY_points);

    this.signDocumentInformation.sign.stamp = {
      page: this.actualPDFPage,
      type: 'qr',
      xPos: Math.round(finalX_points),
      ypos: Math.round(finalY_points),
    };
    console.log('this.signDocumentInformation');
    console.log(this.signDocumentInformation);
 
    // Previsualizar el rectángulo en la posición del clic
    const visualScaleFactor = pageRenderedWidth_pixels / (pageRotation === 90 ? pageOriginalHeight_points : pageOriginalWidth_points);
    const visualRectWidth_pixels = SIGNATURE_WIDTH_POINTS * visualScaleFactor;
    const visualRectHeight_pixels = SIGNATURE_HEIGHT_POINTS * visualScaleFactor;

    this.signUbication = {
      x: x,
      y: y,
      width: visualRectWidth_pixels,
      height: visualRectHeight_pixels,
    };
 
    this.signDocumentInformation.file = this.fileToSign;

    // const right = rect.right;
    // const bottom = rect.bottom;

    // const left = rect.left;
    // const top = rect.top;

    // const ancho = right - left;
    // const alto = bottom - top;
    // console.log("Valor rect (px):", { ancho, alto });

    // // Coordenadas normalizadas respecto a la página
    // const normalizedX = x / this.pdfPageDimensions.width;
    // const normalizedY = y / this.pdfPageDimensions.height;

    // console.log("Página actual:", this.currentPage);
    // console.log("Coordenadas normalizadas:", {
    //   x: normalizedX,
    //   y: normalizedY,
    // });
    // console.log("Coordenadas absolutas (px):", { x, y });
    // const xFinal = x;
    // //const yFinal = this.getPageFromY(y);
    // console.log("Coordenadas encontradas finales: ", { x, y });
    // // console.log(
    // //   "Pagina seleccionada: ",
    // //   this.pdfViewerVar.pdfViewer.currentPageNumber
    // // );
    // // console.log("Pdf Viewer: ", this.pdfViewerVar.pdfViewer);
    // // console.log("Objeto completo: ", this.pdfViewerVar);

    // // console.log(this.pdfViewerVar);
  }
  pageVariable = 1;
  // getPageFromY(y: number): { page: number; relativeY: number } {
  //   let accumulatedHeight = 0;

  //   for (let i = 0; i < this.pageSizes.length; i++) {
  //     accumulatedHeight += this.pageSizes[i].height;

  //     if (y <= accumulatedHeight) {
  //       const relativeY = y - (accumulatedHeight - this.pageSizes[i].height);
  //       return { page: i + 1, relativeY };
  //     }
  //   }

  //   return {
  //     page: this.pageSizes.length,
  //     relativeY: this.pageSizes[this.pageSizes.length - 1].height,
  //   };
  // }
}
