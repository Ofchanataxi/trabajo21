import { Input, Component, inject } from "@angular/core";

@Component({
  selector: 'element-handling',
  templateUrl: './element-handling.component.html',
  styleUrls: ['./element-handling.component.scss'],
})
export class ElementHandlingComponent {
  selectedBusinessLineId: number | null = null;
  mostrarModal: boolean = false;

  getId(id: number | null) {
    this.selectedBusinessLineId = id;
  }
}
