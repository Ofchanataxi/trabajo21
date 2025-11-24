import { Input, Component, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core'; // Import OnChanges and SimpleChanges
import { CatalogManagementService } from 'src/app/services/catalog-management.service';

@Component({
  selector: 'show-id-business-line',
  templateUrl: './show-id-business-line.component.html',
})
export class ShowIdBusinessLineComponent implements OnInit, OnChanges { 
  @Input() allowAllOption: boolean = true;
  @Input() initialSelectedId: number | null = null;
  @Output() idSelected = new EventEmitter<number | null>();

  idStandardBusinessLinesList: StandardBusinessLineOption[] = [];
  selectedIdStandardBusinessLines: number | null = null;

  constructor(private catalogManagementService: CatalogManagementService) {}

  ngOnInit(): void {
    this.obtainStandardCondition();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['initialSelectedId'] && this.initialSelectedId !== undefined) {
      this.selectedIdStandardBusinessLines = this.initialSelectedId;
    }
  }

  obtainStandardCondition() {
    this.catalogManagementService.getStandardBusinessLines().subscribe({
      next: (response: any) => {
        const mappedList: StandardBusinessLineOption[] = response.data
          .map((element: any) => ({
            id: element.id,
            name: element.name?.toUpperCase(),
          }))
          .filter(
            (item: StandardBusinessLineOption) =>
              item.name !== 'SIN DEFINIR' && item.name !== 'OPENWELLS'
          );

        this.idStandardBusinessLinesList = this.allowAllOption
          ? [{ id: 0, name: 'TODOS' }, ...mappedList]
          : mappedList;

        
        if (this.initialSelectedId !== null) {
          this.selectedIdStandardBusinessLines = this.initialSelectedId;
        } else if (this.allowAllOption) {
            this.selectedIdStandardBusinessLines = 0; 
        }
        this.idSelected.emit(this.selectedIdStandardBusinessLines === 0 ? null : this.selectedIdStandardBusinessLines);
      },
      error: err => console.error('Error al obtener los datos:', err),
    });
  }

  conditionSelected(event: any) {
    const selectedId = parseInt(event, 10);
    this.selectedIdStandardBusinessLines = selectedId;
    this.idSelected.emit(selectedId === 0 ? null : selectedId);
  }
}

interface StandardBusinessLineOption {
  id: number;
  name: string;
}