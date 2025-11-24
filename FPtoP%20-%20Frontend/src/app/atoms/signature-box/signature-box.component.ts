import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-signature-box',
  templateUrl: './signature-box.component.html',
  styleUrls: ['./signature-box.component.css'],
})
export class SignatureBoxComponent {
  @Input() signatureTitle: string = '';
  @Input() signatureRole: string = '';
}
