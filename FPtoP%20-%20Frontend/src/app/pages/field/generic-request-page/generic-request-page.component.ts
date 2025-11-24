import { Component, Input, Output, EventEmitter, HostListener } from '@angular/core';

@Component({
  selector: 'app-generic-request-page',
  templateUrl: './generic-request-page.component.html',
  styleUrls: ['./generic-request-page.component.scss'],
})
export class GenericRequestPageComponent {
  @Input() title: string = '';
  @Input() message: string = '';
  @Input() checkboxText: string = '';
  @Input() textboxText: string = '';
  @Input() confirmButtonText: string = '';
  @Input() cancelButtonText: string = '';
  @Input() standardAttributesService: any;
  @Output() confirmAction = new EventEmitter<void>();
  @Output() cancelAction = new EventEmitter<void>();
  @Input() confirmEnabled: boolean = true;

  showOverlay: boolean = false;

  @HostListener('document:keydown.escape', ['$event'])
  handleEscape(event: KeyboardEvent) {
    if (this.showOverlay) {
      this.onCancel();
    }
  }

  
  onConfirm() {
    
    this.confirmAction.emit();
    this.closeOverlay();
  }

  onCancel() {
    this.cancelAction.emit();
    this.closeOverlay();
  }

  openOverlay(text?:string ) {
    
    this.showOverlay = true;
    console.log('open',text)
  }

  closeOverlay() {
    this.showOverlay = false;
  }
}
