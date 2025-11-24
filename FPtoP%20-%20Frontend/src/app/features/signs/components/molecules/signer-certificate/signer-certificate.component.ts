import { Component, EventEmitter, Input, Output } from "@angular/core";
import { RadioButtonValue } from "@slb-dls/angular-material/radio-button-group";

@Component({
  selector: "signer-certificate",
  templateUrl: "./signer-certificate.component.html",
  styleUrls: ["./signer-certificate.component.scss"],
})
export class SignerCertificateComponent {
    constructor() { }
    @Input() signDocumentInformation: any;
    @Output() updateCertificateEvent = new EventEmitter<any>();
    @Output() updatePasswordCertificateEvent = new EventEmitter<any>();
    
    callUpdateCertificate(certificate: File) {
        this.updateCertificateEvent.emit(certificate);
    }

    callUpdatePasswordCertificate(event: Event ) {
        if (event.target instanceof HTMLInputElement) {
            this.updatePasswordCertificateEvent.emit(event.target.value);
        }
        
    }

    // certificateOptions: RadioButtonValue[] = [
    // {
    //   value: "p12",
    //   name: ".p12 o .pfx",
    //   isDefault: true,
    //   isDisabled: false,
    // },
    // ];
    
    onCertificateSelected(event: Event): void {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files.length > 0) {
            this.callUpdateCertificate(input.files[0]);
            this.selectedFileName = input.files[0].name;
        }
        
    }
    
    selectedFileName: String = "";
}
