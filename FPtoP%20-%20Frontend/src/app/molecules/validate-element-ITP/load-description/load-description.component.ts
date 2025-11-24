import { Component, ViewChild } from '@angular/core';
import { ValidateDescriptionComponent } from '../validate-description-ITP/validate-description.component';
@Component({
  selector: 'load-description',
  templateUrl: './load-description.component.html',
  styleUrls: ['./load-description.component.scss'],
})
export class loadDescriptionComponent {
  description: string = '';
  selectedBusinessLine: number | null = null;
  isAllFieldsValid: boolean = false;

  @ViewChild(ValidateDescriptionComponent) validateDescriptionComp: ValidateDescriptionComponent;

  constructor() {}

  onBusinessLineSelected(id: number | null) {
    this.selectedBusinessLine = id;
    this.isAllFieldsValid = false;
  }

  saveDescription(): void {
    const sanitizedDescription = this.description.trim();

    if (!this.selectedBusinessLine) {
      alert('Por favor, selecciona una línea de negocio.');
      console.error('Error: Línea de negocio no seleccionada.');
      return;
    }
    if (!sanitizedDescription) {
      alert('Por favor, ingresa una descripción.');
      console.error('Error: La descripción está vacía.');
      return;
    }
    this.isAllFieldsValid = true;
    setTimeout(() => {
      if (this.validateDescriptionComp) {
        this.validateDescriptionComp.checkDescriptionAndFetchDetails();
      }
    }, 0);
  }
}
